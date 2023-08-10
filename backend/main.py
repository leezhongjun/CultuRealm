from flask import Flask, request, jsonify, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
import datetime
import os, json
from dotenv import load_dotenv
from flask_cors import CORS
import uuid
import json
import random

from utils import checkPassword, checkEmail, checkUsername, checkName
import settings
from apis import *

load_dotenv()

app = Flask(__name__)
CORS(app)

# configuration
app.config['SECRET_KEY'] = os.getenv('BACKEND_SECRET_KEY')
app.config["JWT_COOKIE_SECURE"] = False
FRONTEND_URL = os.getenv('FRONTEND_URL')

basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')

expires_dict = {
    'Access token': datetime.timedelta(minutes=15),
    'Refresh token': datetime.timedelta(days=30)
}

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15) #default is 15 minutes
expires = 15 # minutes
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30) #default is 30 days
refresh_expires = 43200 # minutes


# Configuration for Flask-Mail and itsdangerous
app.config['SECURITY_PASSWORD_SALT'] = os.getenv('SECURITY_PASSWORD_SALT')
app.config['MAIL_SERVER'] = os.getenv('SMTP_SERVER')
app.config['MAIL_PORT'] = os.getenv('SMTP_PORT')
app.config['MAIL_USERNAME'] = os.getenv('SMTP_EMAIL')
app.config['MAIL_PASSWORD'] = os.getenv('SMTP_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)

class UserProfile(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(120), nullable=False)

    race = db.Column(db.String(80), nullable=False)
    religion = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(80), nullable=False)
    age = db.Column(db.String(16), nullable=False)
    high_score = db.Column(db.Integer)
    stories_played = db.Column(db.Integer)
    rating = db.Column(db.Integer)
    achievements = db.Column(db.String(80)) # format "achivement_id:achivement_times achivement_id:achivement_times"
    profile_pic = db.Column(db.LargeBinary)
    image_style = db.Column(db.String(16))

class UserStories(db.Model):
    user_id = db.Column(db.String(36), nullable=False, primary_key=True)
    story_index = db.Column(db.Integer, nullable=False, primary_key=True)
    story_text = db.Column(db.String(1000), nullable=False) # split into 1000 char chunks
    user_choice = db.Column(db.String(400), nullable=False) # Choices are max 400 chars
    img_url = db.Column(db.String(100), nullable=False) # link to image, max 100 chars
    img_prompt = db.Column(db.String(300), nullable=False) # prompt for image, max 100 chars
    achievements = db.Column(db.String(80), nullable=False) # format "achivement_id:achivement_times achivement_id:achivement_times"
    keywords = db.Column(db.String(350), nullable=False) # keywords from story_text, saved as json list
 
class UserState(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    quiz_index = db.Column(db.Integer, nullable=False, default=-1)
    suggestions = db.Column(db.Boolean, nullable=False, default=False)
    story_index = db.Column(db.Integer, nullable=False, default=-1)
    story_seeds = db.Column(db.String(3000), nullable=False, default="[]") # max 3000 chars
    story_state = db.Column(db.String(5000), nullable=False, default="") # max 5000 chars
    story_choice_1 = db.Column(db.String(400), nullable=False, default="") # Choices are max 400 chars
    story_choice_2 = db.Column(db.String(400), nullable=False, default="") # Choices are max 400 chars

# Callback function to check if a JWT exists in the database blocklist
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

def get_reset_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

# This doesnt invalidate the link after the password is reset, but it expires in an hour, this also doesnt have server side validation for password
@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data['token']
        
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
        print(email)
        user = UserProfile.query.filter_by(email=email).first()
        print('user', user)
        if not user: raise Exception
    except:
        return jsonify({'message': 'Invalid token'})
    
    if not data['new_password']:
        return jsonify({'message': 'Valid token'})
    
    hashed_password = generate_password_hash(data['new_password'], method='sha256')
    user.password = hashed_password
    db.session.commit()
    return jsonify({'message': 'Password reset successful'})

@app.route('/reset_password_request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    email = UserProfile.query.filter_by(email=data['emailUsername']).first()
    if not email:
        user = UserProfile.query.filter_by(username=data['emailUsername']).first()
        if not user:
            return jsonify({'message': 'Email/username not found'})
    token = get_reset_token(user.email)
    msg = Message('CultuRealm - Password Reset Request', 
                  sender=app.config['MAIL_USERNAME'], 
                  recipients=[user.email])
    msg.body = f'''To reset your password, visit the following link:
{FRONTEND_URL + '/reset-new-password?token=' + token}
If you did not make this request then simply ignore this email and no changes will be made.
'''
    mail.send(msg)
    return jsonify({'message': 'Password reset link sent to your email'})



@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # check if password, confirm_password, email, name, and username are valid
    if checkPassword(data['password']) == False:
        return jsonify({'message': 'Password must be 8-30 characters long, contain at least one letter, one number, and one special character'})
    if checkEmail(data['email']) == False:
        return jsonify({'message': 'Invalid email'})
    if checkUsername(data['username']) == False:
        return jsonify({'message': 'Invalid username'})
    if checkName(data['name']) == False:
        return jsonify({'message': 'Invalid name'})
    
    # check if email or username already exists
    if UserProfile.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'})
    if UserProfile.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'})
    
    hashed_password = generate_password_hash(data['password'], method='sha256')
    user = UserProfile.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'message': 'Email already exists'})
    user = UserProfile.query.filter_by(username=data['username']).first()
    if user:
        return jsonify({'message': 'Username already exists'})
    
    new_user_profile = UserProfile(name=data['name'], username=data['username'], email=data['email'], password=hashed_password, id=str(uuid.uuid4()), **settings.default_user_profile)
    new_user_state = UserState(id=new_user_profile.id)
    db.session.add(new_user_profile)
    db.session.add(new_user_state)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = UserProfile.query.filter_by(username=data['emailUsername']).first()
    if not user:
        user = UserProfile.query.filter_by(email=data['emailUsername']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login unsuccessful'})
    
    access_token = create_access_token(identity={'id': user.id})
    refresh_token = create_refresh_token(identity={'id': user.id})
    return jsonify({'message':'Login successful', 'accessToken': access_token, 'refreshToken': refresh_token, 'expiresIn': expires, 'refreshTokenExpireIn': refresh_expires, 'id': user.id})

@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def modify_token():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    db.session.add(TokenBlocklist(jti=jti, type=ttype))
    db.session.commit()
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")


@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    ret = {
        'accessToken': create_access_token(identity=current_user)
    }
    return jsonify(ret)

@app.route('/protected', methods=['POST'])
@jwt_required()
def protected():
    username = get_jwt_identity()
    return jsonify(logged_in_as=username)

### Profile Pic ###
@app.route('/set_user_profile_pic', methods=['POST'])
@jwt_required()
def set_profile_pic():
    id = get_jwt_identity()['id']
    user_profile = UserProfile.query.filter_by(id=id).first()
    file = request.files.get('profile_pic')
    if file:
        # Read the binary data of the file using the read() method
        binary_data = file.read()
        user_profile.profile_pic = binary_data
        db.session.commit()
        return {'message': 'Successfully uploaded profile picture'}
    else:
        user_profile.profile_pic = None
        db.session.commit()
        return {'message': 'Successfully removed profile picture'}

@app.route('/get_user_profile_pic', methods=['POST'])
def get_profile_pic():
    data = request.get_json()
    print(data, flush=True)
    id = data["id"]
    user_profile = UserProfile.query.filter_by(id=id).first()
    if not user_profile:
        return {'message': 'User profile not found'}
    binary_data = user_profile.profile_pic
    return Response(binary_data, content_type='image/jpeg')
    
### Preference ###
@app.route('/set_user_pref', methods=['POST'])
@jwt_required()
def set_user_pref():
    data = request.get_json()
    id = get_jwt_identity()['id']
    
    user_profile = UserProfile.query.filter_by(id=id).first()
    
    if not user_profile:
        return jsonify({'message': 'User profile not found'})
    else:
        # check if username or email already exists
        if UserProfile.query.filter_by(email=data['email']).first() and data['email'] != user_profile.email:
            return jsonify({'message': 'Email already exists'})
        if UserProfile.query.filter_by(username=data['username']).first() and data['username'] != user_profile.username:
            return jsonify({'message': 'Username already exists'})
        
        if data['age'] != user_profile.age or data['race'] != user_profile.race or data['gender'] != user_profile.gender:
            user_state = UserState.query.filter_by(id=id).first()
            user_state.story_seeds = "[]"
            user_state.story_index = -1
            user_state.story_state = ""

        user_profile.age = data['age']
        user_profile.race = data['race']
        user_profile.religion = data['religion']
        user_profile.gender = data['gender']
        user_profile.image_style = data['image_style']
        user_profile.username = data['username']
        user_profile.name = data['name']
        user_profile.email = data['email']

    db.session.commit()
    return jsonify({'message': 'Success'})


@app.route('/get_user_pref', methods=['POST'])
@jwt_required()
def get_user_pref():
    id = get_jwt_identity()['id']
    user_profile = UserProfile.query.filter_by(id=id).first()
    if not user_profile:
        return {'message': 'User profile not found'}
    res = {}
    for key in settings.default_user_profile:
        res[key] = getattr(user_profile, key)
    res['username'] = user_profile.username
    res['name'] = user_profile.name
    res['email'] = user_profile.email
    res['profile_pic'] = None

    return res

@app.route('/get_user_pref_public', methods=['POST'])
def get_user_pref_by_id():
    data = request.get_json()
    user_profile = UserProfile.query.filter_by(id=data['id']).first()
    if not user_profile:
        return {'message': 'User profile not found'}
    res = {}
    for key in settings.default_user_profile:
        res[key] = getattr(user_profile, key)
    res['username'] = user_profile.username
    res['name'] = user_profile.name
    res['email'] = None # remove email
    res['image_style'] = None # remove image style
    res['profile_pic'] = None

    return res

@app.route('/leaderboard', methods=['POST'])
def leaderboard():
    data = request.get_json()
    users = UserProfile.query.order_by(UserProfile.rating.desc()).limit(data['limit']).all()
    res = []
    for user in users:
        res.append({'name': user.name, 'username': user.username, 'rating': user.rating, 'race': user.race, 'age': user.age, 'achievements': user.achievements, 'id': user.id})
    return jsonify(res)

@app.route('/handle_gameplay', methods=['POST']) #backend for story page
def handle_gameplay():
    data = request.get_json()
    print(data)
    return jsonify(data)

@app.route('/handle_image_style', methods=['POST'])
@jwt_required()
def img_style():
    id = get_jwt_identity()['id']
    user = UserProfile.query.filter_by(id=id).first()
    return {'image_style': user.image_style}

@app.route('/start_story', methods=['POST'])
@jwt_required()
def start_story():
    id = get_jwt_identity()['id']
    data = request.get_json()
    # clear previous story
    # remove old story from db
    # delete all entries in UserStories db with user id
    UserStories.query.filter_by(user_id=id).delete()

    # get user state
    user_state = UserState.query.filter_by(id=id).first()

    # create new story
    # get user data
    user_profile = UserProfile.query.filter_by(id=id).first()
    # get story seeds
    story_seeds = json.loads(user_state.story_seeds)
    
    # create more seeds if len == 0
    if len(story_seeds) == 0:
        story_seeds = get_story_seeds(age=user_profile.age, gender=user_profile.gender, race=user_profile.race)

    # sample a seed
    i = random.randint(0, len(story_seeds) - 1)
    seed = story_seeds[i]

    # remove the seed from the list
    story_seeds.pop(i)

    # update db with new seed list
    user_state.story_seeds = json.dumps(story_seeds)

    # call api -> story text
    story_text = get_start_story(seed=seed, name=user_profile.name, age=user_profile.age, gender=user_profile.gender, race=user_profile.race)
    story_state = [{
        "role": "assistant",
        "content": story_text,
    }]
    user_state.story_state = json.dumps(story_state)

    # image gen 
    img_prompt = get_start_img_prompt(story_text)
    # img_url = gen_img(img_prompt, user_profile.image_style)

    # call api -> story audio (do in frontend)

    # update suggestions in UserState
    kwargs = {}
    if data["suggestions"]:
        user_state.suggestions = True
        # call api -> suggestions
        suggestions = get_suggestions(story_text)
        user_state.story_choice_1 = suggestions[0]
        user_state.story_choice_2 = suggestions[1]
        kwargs["suggestion_1"] = suggestions[0]
        kwargs["suggestion_2"] = suggestions[1]
    else:
        user_state.suggestions = False
    # if achivement call api -> achivement
    new_achivements = ""
    
    # get keyword list
    keywords = get_keywords(story_text)

    # write to db
    # make new entry in UserStories db
    user_story = UserStories(user_id=id, story_index=0, story_text=story_text, user_choice="", img_url="", img_prompt=img_prompt, achievements=new_achivements, keywords=json.dumps(keywords))
    db.session.add(user_story)
    # set story index to 0 in db
    user_state.story_index = 0
    # return data
    db.session.commit()
    return {'image_style': user_profile.image_style,'story_text': story_text, 'user_choice': "", 'achievements': new_achivements, 'keywords': keywords, **kwargs}

# regen img endpoint
@app.route('/regen_img', methods=['POST'])
@jwt_required()
def regen_img():
    id = get_jwt_identity()['id']
    data = request.get_json()
    # call api -> img gen
    user_profile = UserProfile.query.filter_by(id=id).first()
    # get image style from data
    image_style = data['image_style']
    # update image style in db
    user_profile.image_style = image_style
    story_index = data['story_index']
    user_story = UserStories.query.filter_by(user_id=id, story_index=story_index).first()
    img_prompt = user_story.img_prompt
    img_url = gen_img(img_prompt, user_profile.image_style)
    user_story.img_url = img_url

    db.session.commit()
    return {'image_url': img_url}

# reset story index endpoint
@app.route('/reset_story_index', methods=['POST'])
@jwt_required()
def reset_story_index():
    id = get_jwt_identity()['id']
    # query db
    user_state = UserState.query.filter_by(id=id).first()
    # set story index to 0 in db
    user_state.story_index = -1
    db.session.commit()
    # return data
    return {'message': "Success"}

# regen suggestion endpoint
@app.route('/regen_suggestion', methods=['POST'])
@jwt_required()
def regen_suggestion():
    id = get_jwt_identity()['id']
    data = request.get_json()
    # call api -> suggestions
    return


@app.route('/story_index', methods=['POST'])
@jwt_required()
def story_index():
    id = get_jwt_identity()['id']
    data = request.get_json()
    user_state = UserState.query.filter_by(id=id).first()
    # if not new index
    if data["index"] <= user_state.story_index:
        # query db
        user_story = UserStories.query.filter_by(user_id=id, story_index=data["index"]).first()
        # return data
        return {'story_text': user_story.story_text, 'img_url': user_story.img_url, 'user_choice': user_story.user_choice, 'achievements': user_story.achievements, 'keywords': json.loads(user_story.keywords)}


    # if new index
    # if previous index need resp, get user response from data
    # censor user response form data
    # write to db
    # if achivement, add achivement to database
    # return data
    return

@app.route('/get_state', methods=['POST'])
@jwt_required()
def get_story_state():
    id = get_jwt_identity()['id']
    state = UserState.query.filter_by(id=id).first()
    if state is None:
        state = UserState(id=id)
        db.session.add(state)
        db.session.commit()
    return {'story_index': state.story_index, 'quiz_index': state.quiz_index}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

