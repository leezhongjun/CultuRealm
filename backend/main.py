from flask import Flask, request, jsonify, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
import datetime
import os
from dotenv import load_dotenv
from flask_cors import CORS
import uuid
import json
import random
from collections import defaultdict
import asyncio

from utils import checkPassword, checkEmail, checkUsername, checkName, calc_new_rating, parse_achievements, format_achievements
import settings
from apis import *

load_dotenv()

app = Flask(__name__)
CORS(app)
def prefix_route(route_function, prefix='', mask='{0}{1}'):
  '''
    Defines a new route function with a prefix.
    The mask argument is a `format string` formatted with, in that order:
      prefix, route
  '''
  def newroute(route, *args, **kwargs):
    '''New function to prefix the route'''
    return route_function(mask.format(prefix, route), *args, **kwargs)
  return newroute
app.route = prefix_route(app.route, '/api')

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

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(
    minutes=15)  # default is 15 minutes
expires = 15  # minutes
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(
    days=30)  # default is 30 days
refresh_expires = 43200  # minutes


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
    # religion = db.Column(db.String(80), nullable=False)
    race = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(80), nullable=False)
    age = db.Column(db.String(16), nullable=False)
    high_score = db.Column(db.Integer)
    stories_played = db.Column(db.Integer)
    rating = db.Column(db.Integer)
    # format "achivement_id:achivement_times achivement_id:achivement_times"
    achievements = db.Column(db.String(80))
    profile_pic = db.Column(db.LargeBinary)
    image_style = db.Column(db.String(16))
    global_unlocked = db.Column(db.Boolean, default=False)


class UserStories(db.Model):
    user_id = db.Column(db.String(36), nullable=False, primary_key=True)
    story_index = db.Column(db.Integer, nullable=False, primary_key=True)
    # split into 1000 char chunks
    story_text = db.Column(db.String(1000), nullable=False)
    # Choices are max 400 chars
    user_response = db.Column(db.String(400), nullable=False)
    # link to image, max 100 chars
    img_url = db.Column(db.String(100), nullable=False)
    # prompt for image, max 100 chars
    img_prompt = db.Column(db.String(300), nullable=False)
    # format "achivement_id:achivement_times achivement_id:achivement_times"
    achievements = db.Column(db.String(80), nullable=False)
    # keywords from story_text, saved as json list
    keywords = db.Column(db.String(350), nullable=False)
    # feedback from user, max 1000 chars
    feedback = db.Column(db.String(1000), nullable=False)


class UserState(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    # quiz_index = db.Column(db.Integer, nullable=False, default=-1)
    suggestions = db.Column(db.Boolean, nullable=False, default=False)
    story_index = db.Column(db.Integer, nullable=False, default=-1)
    story_seeds = db.Column(db.String(3000), nullable=False,
                            default="[]")  # max 3000 chars
    story_state = db.Column(
        db.String(5000), nullable=False, default="")  # max 5000 chars
    # Choices are max 400 chars
    suggestion_1 = db.Column(db.String(400), nullable=False, default="")
    # Choices are max 400 chars
    suggestion_2 = db.Column(db.String(400), nullable=False, default="")
    score = db.Column(db.Integer, nullable=False, default=0)
    opp_score = db.Column(db.Integer, nullable=False, default=0)
    final_score = db.Column(db.Integer, nullable=False, default=0)
    old_rating = db.Column(db.Integer, nullable=False, default=1500)
    custom_story_id = db.Column(db.String(36), nullable=False, default="")
    old_high_score = db.Column(db.Integer, nullable=False, default=0)
    country = db.Column(db.String(80), nullable=False, default="Singapore")


class CustomStories(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    desc = db.Column(db.String(1000), nullable=False)
    user_id = db.Column(db.String(36), nullable=False)
    upvotes = db.Column(db.Integer, nullable=False, default=0)
    play_count = db.Column(db.Integer, nullable=False, default=0)
    high_score = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.datetime.utcnow)
    tags = db.Column(db.String(80), nullable=False, default="")


class UpvoteSystem(db.Model):
    user_id = db.Column(db.String(36), nullable=False, primary_key=True)
    story_id = db.Column(db.String(36), nullable=False, primary_key=True)
    votes = db.Column(db.Integer, nullable=False)


class ChallengeHistory(db.Model):
    user_id = db.Column(db.String(36), nullable=False, primary_key=True)
    event = db.Column(db.Integer, nullable=False, primary_key=True)
    challenge_score = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer, nullable=False)
    # 1 for easy, 2 for medium, 3 for hard
    difficulty = db.Column(db.Integer, nullable=False, primary_key=True)


class UserStateC(db.Model):
    id = db.Column(db.String(36), nullable=False, primary_key=True)
    event = db.Column(db.Integer, nullable=False, default="")
    essay = db.Column(db.String(5000), nullable=False, default="")
    challenge_score = db.Column(db.Integer, nullable=False, default=0)
    # 1 for easy, 2 for medium, 3 for hard
    difficulty = db.Column(db.Integer, nullable=False, default=1)
    time_start = db.Column(db.Integer, nullable=False, default=0)
    # -1: title, 0: essay, 1: mcq, 2: review
    play_state = db.Column(db.Integer, nullable=False, default=-1)
    time_taken = db.Column(db.Integer, nullable=False, default=0)
    qns = db.Column(db.String(5000), nullable=False, default="")
    ans = db.Column(db.String(5000), nullable=False, default="")
    exp = db.Column(db.String(5000), nullable=False, default="")
    user_ans = db.Column(db.String(5000), nullable=False, default="")

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
        email = serializer.loads(
            token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
        print(email)
        user = UserProfile.query.filter_by(email=email).first()
        print('user', user)
        if not user:
            raise Exception
    except:
        return jsonify({'message': 'Invalid token'})

    if not data['new_password']:
        return jsonify({'message': 'Valid token'})

    hashed_password = generate_password_hash(
        data['new_password'], method='sha256')
    user.password = hashed_password
    db.session.commit()
    return jsonify({'message': 'Password reset successful'})


@app.route('/reset_password_request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    email = UserProfile.query.filter_by(email=data['emailUsername']).first()
    if not email:
        user = UserProfile.query.filter_by(
            username=data['emailUsername']).first()
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

    new_user_profile = UserProfile(name=data['name'], username=data['username'], email=data['email'],
                                   password=hashed_password, id=str(uuid.uuid4()), **settings.default_user_profile)
    new_user_state = UserState(id=new_user_profile.id)
    db.session.add(new_user_profile)
    db.session.add(new_user_state)

    ### For challenge mode ###
    new_user_state_c = UserStateC(id=new_user_profile.id)
    db.session.add(new_user_state_c)

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
    return jsonify({'message': 'Login successful', 'accessToken': access_token, 'refreshToken': refresh_token, 'expiresIn': expires, 'refreshTokenExpireIn': refresh_expires, 'id': user.id})


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

        if checkEmail(data['email']) == False:
            return jsonify({'message': 'Invalid email'})
        if checkUsername(data['username']) == False:
            return jsonify({'message': 'Invalid username'})
        if checkName(data['name']) == False:
            return jsonify({'message': 'Invalid name'})

        if data['age'] != user_profile.age or data['race'] != user_profile.race or data['gender'] != user_profile.gender:
            user_state = UserState.query.filter_by(id=id).first()
            user_state.story_seeds = "[]"
            # user_state.story_index = -1
            # user_state.story_state = ""

        user_profile.age = data['age']
        user_profile.race = data['race']
        # user_profile.religion = data['religion']
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
    id = request.get_json()['id']
    user_profile = UserProfile.query.filter_by(id=id).first()
    if not user_profile:
        return {'message': 'User profile not found'}
    res = {}
    for key in settings.default_user_profile:
        res[key] = getattr(user_profile, key)
    res['username'] = user_profile.username
    res['name'] = user_profile.name
    res['email'] = None  # remove email
    res['image_style'] = None  # remove image style
    res['profile_pic'] = None
    res['challenges_played'] = f"{db.session.query(func.count(ChallengeHistory.event.distinct())).filter(ChallengeHistory.user_id == id).scalar()}/{len(settings.all_event_names)}"
    res['easy_high_score'] = db.session.query(func.max(ChallengeHistory.challenge_score)).filter(
        ChallengeHistory.user_id == id, ChallengeHistory.difficulty == 1).scalar()
    res['medium_high_score'] = db.session.query(func.max(ChallengeHistory.challenge_score)).filter(
        ChallengeHistory.user_id == id, ChallengeHistory.difficulty == 2).scalar()
    res['hard_high_score'] = db.session.query(func.max(ChallengeHistory.challenge_score)).filter(
        ChallengeHistory.user_id == id, ChallengeHistory.difficulty == 3).scalar()

    if not res['easy_high_score']:
        res['easy_high_score'] = 0
    if not res['medium_high_score']:
        res['medium_high_score'] = 0
    if not res['hard_high_score']:
        res['hard_high_score'] = 0

    return res


@app.route('/leaderboard', methods=['POST'])
def leaderboard():
    data = request.get_json()
    users = UserProfile.query.order_by(
        UserProfile.rating.desc()).limit(data['limit']).all()
    res = []
    for user in users:
        res.append({'name': user.name, 'username': user.username, 'rating': user.rating,
                   'race': user.race, 'age': user.age, 'achievements': user.achievements, 'id': user.id})
    return jsonify(res)


@app.route('/handle_gameplay', methods=['POST'])  # backend for story page
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


@app.route('/get_story_desc', methods=['POST'])
@jwt_required()
def get_story_desc():
    id = get_jwt_identity()['id']
    user_profile = UserProfile.query.filter_by(id=id).first()
    seed = get_story_seed(age=user_profile.age,
                          gender=user_profile.gender, race=user_profile.race)
    title = get_story_title(seed)
    return {'story_desc': seed, 'story_title': title}


@app.route('/start_story', methods=['POST'])
@jwt_required()
async def start_story():
    id = get_jwt_identity()['id']
    data = request.get_json()
    # clear previous story
    # remove old story from db
    # delete all entries in UserStories db with user id
    with app.app_context():
        UserStories.query.filter_by(user_id=id).delete()

        # get user state
        user_state = UserState.query.filter_by(id=id).first()

        # create new story
        # get user data
        user_profile = UserProfile.query.filter_by(id=id).first()

        user_state.custom_story_id = data["story_id"]
        is_custom = user_state.custom_story_id != ""

        if is_custom:
            if user_state.custom_story_id == "temp":
                seed = data["seed"]
                flagged, cats = moderate_input(seed)
                if not flagged:
                    flagged, cats = moderate_summary(seed)
                if flagged:
                    flagged_text = "Inappropriate content in your response. Please try again. Flags detected: " + \
                        ", ".join(cats) + "."
                    return {'flagged': True, 'flagged_text': flagged_text}
            else:
                seed = CustomStories.query.filter_by(
                    id=user_state.custom_story_id).first().desc

        else:

            if data['country'] != "Singapore":
                if data['country'] not in settings.countries:
                    return {'flagged': True, 'flagged_text': "Invalid country!"}
                if data['country'] == "Random":
                    data['country'] = random.choice(settings.countries[1:])
                user_state.country = data['country']
                seed = get_story_seed(age=user_profile.age, gender=user_profile.gender,
                                      race=user_profile.race, country=user_state.country)

            else:
                user_state.country = data['country']

                # get story seeds
                story_seeds = json.loads(user_state.story_seeds)

                # create more seeds if len == 0
                if len(story_seeds) == 0:
                    story_seeds = get_story_seeds(
                        age=user_profile.age, gender=user_profile.gender, race=user_profile.race)

                # sample a seed
                i = random.randint(0, len(story_seeds) - 1)
                seed = story_seeds[i]

                # remove the seed from the list
                story_seeds.pop(i)

                # update db with new seed list
                user_state.story_seeds = json.dumps(story_seeds)

        # if data['country'] not in settings.countries:
        #     return {'flagged': True, 'flagged_text': "Invalid country!"}
        # if data['country'] == "Random":
        #     data['country'] = random.choice(settings.countries[1:])
        # user_state.country = data['country']
        # seed = get_story_seed(age=user_profile.age, gender=user_profile.gender,
        #                         race=user_profile.race, country=user_state.country)

        # call api -> story text
        story_text = "END"
        while "END" in story_text:
            story_text, system_message = get_start_story(
                seed=seed, name=user_profile.name, age=user_profile.age, gender=user_profile.gender, race=user_profile.race, country=user_state.country)
        story_state = [system_message, {
            "role": "assistant",
            "content": story_text,
        }]
        user_state.story_state = json.dumps(story_state)

        # image gen
        async def img_thread():
            img_prompt = await get_start_img_prompt(story_text, name=user_profile.name,
                                            age=user_profile.age, gender=user_profile.gender, race=user_profile.race)
            # img_url = gen_img(img_prompt, user_profile.image_style)
            return img_prompt

        # suggestions
        async def suggestion_thread():
            kwargs = {}
            if data["suggestions"]:
                # user_state.suggestions = True
                # call api -> suggestions
                suggestions = await get_suggestions(story_text)
                suggestions = [suggestion.replace('*', '')
                            for suggestion in suggestions]
                # user_state.suggestion_1 = suggestions[0]
                # user_state.suggestion_2 = suggestions[1]
                kwargs["suggestion_1"] = suggestions[0]
                kwargs["suggestion_2"] = suggestions[1]
            # else:
                # user_state.suggestions = False
            return kwargs

        # if achivement call api -> achivement
        new_achivements = ""

        # keywords
        async def keyword_thread():
            # get keyword list
            keywords = await get_keywords(story_text)
            return keywords

        tasks = []
        for f in (img_thread, suggestion_thread, keyword_thread):
            task = asyncio.create_task(f())
            tasks.append(task)
        res = await asyncio.gather(*tasks)

        if data["suggestions"]:
            user_state.suggestions = True
            user_state.suggestion_1 = res[1]["suggestion_1"]
            user_state.suggestion_2 = res[1]["suggestion_2"]
        else:
            user_state.suggestions = False

        # write to db
        # make new entry in UserStories db
        user_story = UserStories(user_id=id, story_index=0, story_text=story_text, user_response="", img_url="",
                                    img_prompt=res[0], achievements=new_achivements, keywords=json.dumps(res[2]), feedback="")
        db.session.add(user_story)
        # set story index to 0 in db
        user_state.story_index = 0
        # return data
        db.session.commit()
        return {'country': user_state.country, 'flagged': False, 'image_style': user_profile.image_style, 'story_text': story_text, 'user_response': "", 'achievements': new_achivements, 'keywords': res[2], **res[1]}

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
    user_story = UserStories.query.filter_by(
        user_id=id, story_index=story_index).first()
    if story_index > 0:
        prev_user_story = UserStories.query.filter_by(
            user_id=id, story_index=story_index-1).first()
        if prev_user_story.img_url:
            img = prev_user_story.img_url
        else:
            img = ""
    else:
        img = ""
    img_url = gen_image_v3(user_story.img_prompt, user_profile.image_style, img)
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
    # set story index to -1 in db
    user_state.story_index = -1
    user_state.custom_story_id = ""
    db.session.commit()
    # return data
    return {'message': "Success"}

# regen suggestion endpoint


@app.route('/regen_suggestions', methods=['POST'])
@jwt_required()
def regen_suggestions():
    id = get_jwt_identity()['id']
    data = request.get_json()
    story_index = data['story_index']
    user_state = UserState.query.filter_by(id=id).first()
    user_story = UserStories.query.filter_by(
        user_id=id, story_index=story_index).first()
    suggestions = get_suggestions(user_story.story_text)
    user_state.suggestion_1 = suggestions[0].replace('*', '')
    user_state.suggestion_1 = suggestions[1].replace('*', '')
    db.session.commit()
    return {'suggestion_1': suggestions[0], 'suggestion_2': suggestions[1]}


@app.route('/story_index', methods=['POST'])
@jwt_required()
async def story_index():
    id = get_jwt_identity()['id']
    data = request.get_json()
    with app.app_context():
        user_state = UserState.query.filter_by(id=id).first()

        # story is starting
        if user_state.story_index < 0:
            return {'story_starting': True}

        user_profile = UserProfile.query.filter_by(id=id).first()
        cur_story_index = data['story_index']

        # if end index
        final = cur_story_index == settings.max_story_index
        is_custom = user_state.custom_story_id != ""

        # if not new index
        if cur_story_index <= user_state.story_index:
            # query db
            user_story = UserStories.query.filter_by(
                user_id=id, story_index=cur_story_index).first()
            kwargs = {}
            if user_state.suggestions and cur_story_index == user_state.story_index and not final:
                kwargs['suggestion_1'] = user_state.suggestion_1
                kwargs['suggestion_2'] = user_state.suggestion_2

            if final:
                kwargs['final_score'] = user_state.final_score
                if is_custom:
                    # custom story previous high score
                    kwargs['prev_high_score'] = user_state.old_high_score
                kwargs['new_rating'] = user_profile.rating
                kwargs['old_rating'] = user_state.old_rating

            # return data
            return {'unlock_rating': settings.global_unlocked_rating, 'country': user_state.country, 'is_custom': is_custom, 'is_final': final, 'has_suggestions': user_state.suggestions, 'story_starting': False, 'story_text': user_story.story_text, 'image_url': user_story.img_url, 'user_response': user_story.user_response, 'achievements': user_story.achievements, 'image_style': user_profile.image_style, 'keywords': json.loads(user_story.keywords), 'feedback': user_story.feedback, **kwargs}

        # if new index
        # get resp
        resp = data["user_response"]  # resp here is "do: ..."

        # response moderation
        flagged, cats = moderate_input(resp)
        if not flagged:
            flagged, cats = moderate_response(resp)
        if flagged:
            flagged_text = "Inappropriate content in your response. Please try again. Flags detected: " + \
                ", ".join(cats) + "."
            return {'flagged': True, 'flagged_text': flagged_text}

        story_state = json.loads(user_state.story_state)
        prev_story_text = story_state[-1]["content"]
        story_state += [{
            "role": "user",
            "content": "I " + resp + ("\n\nSTORY ENDS THIS TURN" if final else "."),
        }]
        story_text = "SOMERANDOMSTRING" if final else "END"
        while (final and "SOMERANDOMSTRING" in story_text) or (not final and "END" in story_text):
            story_text = ask_gpt_convo(story_state).replace("*", "")
        story_state += [{
            "role": "assistant",
            "content": story_text,
        }]
        user_state.story_state = json.dumps(story_state)

        async def keyword_thread():
            # keywords
            keywords = await get_keywords(story_text)
            return keywords

        # feedback
        async def feedback_thread():
            feedback, score = await get_feedback_and_score(resp, prev_story_text)
            return feedback, score
        
        async def opp_score_thread():
            opp_score = await get_opportunity_score(
                user_profile.name, prev_story_text)
            return opp_score

        # achivement
        async def achievement_thread():
            achievements_ls = await get_achievements_score(
                user_profile.name, prev_story_text, "I " + resp)
            achievements_dict = parse_achievements(user_profile.achievements)
            ach_d_new = {}
            for ach in achievements_ls:
                if ach not in achievements_dict.keys():
                    achievements_dict[ach] = 0
                achievements_dict[ach] += 1
                ach_d_new[ach] = achievements_dict[ach]
            new_achievements = format_achievements(ach_d_new)
            return new_achievements, achievements_dict

        # suggestions
        async def suggestion_thread():
            if user_state.suggestions and not final:
                suggestions = await get_suggestions(story_text)
                return suggestions
            
        prev_user_story = UserStories.query.filter_by(
            user_id=id, story_index=cur_story_index-1).first()
            
        # img prompt
        async def img_thread():
            img_prompt = await get_start_img_prompt(story_text, name=user_profile.name,
                                            age=user_profile.age, gender=user_profile.gender, race=user_profile.race, prev_text=prev_user_story.story_text, prev_img_prompt=prev_user_story.img_prompt)
            return img_prompt

        tasks = []
        for f in (img_thread, suggestion_thread, keyword_thread, feedback_thread, opp_score_thread, achievement_thread):
            task = asyncio.create_task(f())
            tasks.append(task)
        res = await asyncio.gather(*tasks)

        new_achievements, achievements_dict = res[5]
        opp_score = res[4]
        feedback, score = res[3]
        keywords = res[2]
        suggestions = res[1]
        img_prompt = res[0]

        
        user_state.opp_score += opp_score
        user_state.score += score * opp_score

        if final:
            # final score updating
            final_score = int(user_state.score *
                            (100 / user_state.opp_score) / 100)
            user_state.final_score = final_score
            user_profile.stories_played += 1

            # just update user high score, regardless of custom or not
            if final_score > user_profile.high_score:
                user_profile.high_score = final_score

            if is_custom:
                # save old high score to user state
                if user_state.custom_story_id == "temp":
                    user_state.old_high_score = 0
                else:
                    # save old high score of custom story in user state
                    custom_story = CustomStories.query.filter_by(
                        id=user_state.custom_story_id).first()
                    user_state.old_high_score = custom_story.high_score
                    # change high score in custom story
                    if final_score > custom_story.high_score:
                        custom_story.high_score = final_score
                    # increase custom story play count
                    custom_story.play_count += 1

            else:
                # rating
                user_state.old_rating = user_profile.rating
                user_profile.rating = calc_new_rating(
                    final_score, user_profile.stories_played, user_state.old_rating)
                if user_profile.rating > settings.global_unlocked_rating:
                    user_profile.global_unlocked = True
        


        user_profile.achievements = format_achievements(achievements_dict)
        
        if user_state.suggestions and not final:
            user_state.suggestion_1 = suggestions[0]
            user_state.suggestion_2 = suggestions[1]


        # write to db
        user_state.story_index = cur_story_index
        prev_user_story.user_response = resp
        prev_user_story.feedback = feedback
        prev_user_story.achievements = new_achievements

        new_user_story = UserStories(user_id=id, story_index=cur_story_index, story_text=story_text, img_prompt=img_prompt,
                                    img_url="", user_response="", feedback="", achievements="", keywords=json.dumps(keywords))
        db.session.add(new_user_story)
        db.session.commit()

        # return data
        return {'flagged': False, 'achievements': new_achievements, 'feedback': feedback}


@app.route('/get_state', methods=['POST'])
@jwt_required()
def get_story_state():
    id = get_jwt_identity()['id']
    state = UserState.query.filter_by(id=id).first()
    if state is None:
        state = UserState(id=id)
        db.session.add(state)
        db.session.commit()
    return {'story_index': state.story_index, 'custom_story_id': state.custom_story_id}


@app.route('/get_stories', methods=['POST'])
def get_stories():
    custom_stories = CustomStories.query.all()
    # link user_id with username
    for i in range(custom_stories.__len__()):
        custom_stories[i] = custom_stories[i].__dict__
        # print(custom_stories[i])
        user = UserProfile.query.filter_by(
            id=custom_stories[i]['user_id']).first()
        custom_stories[i]['username'] = user.username
        custom_stories[i]['_sa_instance_state'] = None
        custom_stories[i]['user_votes'] = 0
    return {'stories': custom_stories, 'tags': settings.tags}


@app.route('/get_stories_proc', methods=['POST'])
@jwt_required()
def get_stories_proc():
    custom_stories = CustomStories.query.all()
    id = get_jwt_identity()['id']
    # link user_id with username
    for i in range(custom_stories.__len__()):
        custom_stories[i] = custom_stories[i].__dict__
        # print(custom_stories[i])
        user = UserProfile.query.filter_by(
            id=custom_stories[i]['user_id']).first()
        custom_stories[i]['username'] = user.username
        custom_stories[i]['_sa_instance_state'] = None
        vote_user_story = UpvoteSystem.query.filter_by(
            user_id=id, story_id=custom_stories[i]['id']).first()
        if vote_user_story is None:
            vote_user_story = UpvoteSystem(
                user_id=id, story_id=custom_stories[i]['id'], votes=0)
        custom_stories[i]['user_votes'] = vote_user_story.votes
    return {'stories': custom_stories, 'tags': settings.tags}


@app.route('/add_custom_story', methods=['POST'])
@jwt_required()
def add_custom_story():
    id = get_jwt_identity()['id']
    data = request.get_json()
    story_text = data["story_text"]
    title = data["title"]
    tags = data["tags"]
    for tag in tags:
        if tag['text'] not in settings.raw_tags:
            print(tag)
            return {'flagged': True, 'flagged_text': 'Invalid tag!'}
    flagged, cats = moderate_input(story_text)
    if not flagged:
        flagged, cats = moderate_summary(story_text)
    if flagged:
        flagged_text = "Inappropriate content in your response. Please try again. Flags detected: " + \
            ", ".join(cats) + "."
        return {'flagged': True, 'flagged_text': flagged_text}
    flagged, cats = moderate_input(title)
    if flagged:
        flagged_text = "Inappropriate content in your response. Please try again. Flags detected: " + \
            ", ".join(cats) + "."
        return {'flagged': True, 'flagged_text': flagged_text}
    story_id = str(uuid.uuid4())
    new_custom_story = CustomStories(
        user_id=id, tags=json.dumps(tags), desc=story_text, title=title, id=story_id)
    db.session.add(new_custom_story)
    db.session.commit()
    return {'flagged': False, 'story_id': story_id}


@app.route('/vote_story', methods=['POST'])
@jwt_required()
def vote_story():
    id = get_jwt_identity()['id']
    data = request.get_json()
    story_id = data["story_id"]
    votes = data["votes"]
    vote_user_story = UpvoteSystem.query.filter_by(
        user_id=id, story_id=story_id).first()
    story = CustomStories.query.filter_by(id=story_id).first()
    if vote_user_story is None:
        if votes == 1:
            story.upvotes += 1
        elif votes == -1:
            story.upvotes -= 1
        vote_user_story = UpvoteSystem(
            user_id=id, story_id=story_id, votes=votes)
        db.session.add(vote_user_story)
    else:
        if vote_user_story.votes == -1:
            if votes == 1:
                story.upvotes += 2
            elif votes == 0:
                story.upvotes += 1
        elif vote_user_story.votes == 1:
            if votes == -1:
                story.upvotes -= 2
            elif votes == 0:
                story.upvotes -= 1
        elif vote_user_story.votes == 0:
            if votes == 1:
                story.upvotes += 1
            elif votes == -1:
                story.upvotes -= 1
    prev = vote_user_story.votes
    vote_user_story.votes = votes
    db.session.commit()
    return {'prev': prev, 'new': votes}


@app.route('/delete_story', methods=['POST'])
@jwt_required()
def delete_story():
    id = get_jwt_identity()['id']
    data = request.get_json()
    story_id = data["story_id"]
    story = CustomStories.query.filter_by(id=story_id).first()
    if story.user_id != id:
        return {'success': False}
    db.session.delete(story)
    user_stories_votes = UpvoteSystem.query.filter_by(story_id=story_id).all()
    for user_story_vote in user_stories_votes:
        db.session.delete(user_story_vote)
    db.session.commit()
    return {'success': True}


@app.route('/completed_profile', methods=['POST'])
@jwt_required()
def completed_profile():
    id = get_jwt_identity()['id']
    user_profile = UserProfile.query.filter_by(id=id).first()
    fields = [user_profile.race, user_profile.gender, user_profile.age]
    completed_profile = all(field != "Unspecified" for field in fields)
    return jsonify({'rating': user_profile.rating, 'unlock_rating': settings.global_unlocked_rating, 'completed_profile': completed_profile, 'global_unlocked': user_profile.global_unlocked})


@app.route('/challenge_essay', methods=['POST'])
@jwt_required()
def challenge_essay():
    id = get_jwt_identity()['id']
    userStateC = UserStateC.query.filter_by(id=id).first()
    # Generate and store essay
    # Store topic and difficulty
    data = request.get_json()
    event = data["event"]
    if event not in settings.all_event_names:
        return {'message': 'Invalid event'}
    difficulty = data["difficulty"]
    if settings.challenge_play_req[difficulty] > db.session.query(func.count(ChallengeHistory.event.distinct())).filter(ChallengeHistory.user_id == id).scalar():
        return {'message': 'Not enough plays'}
    essay = get_challenge_essay(event, settings.len_essay[difficulty])
    # essay = """Chinese New Year in Singapore is a vibrant celebration that intertwines history and culture. Rooted in Chinese traditions, it marks the lunar new year's arrival with elaborate festivities. The festival arrived with early Chinese immigrants and evolved into a blend of traditions, encompassing vibrant parades, intricate lion and dragon dances, and exuberant firework displays. Houses are adorned with red decorations symbolizing luck and prosperity. Families reunite over feasts, featuring symbolic dishes like dumplings and fish. Mandarin oranges exchanged for good fortune. The Chingay Parade, a highlight, showcases Singapore's multicultural essence. Chinese New Year encapsulates Singapore's rich heritage while forging bonds among its diverse population."""
    userStateC.event = event
    userStateC.essay = essay
    userStateC.difficulty = difficulty
    userStateC.play_state = 0
    db.session.commit()
    return {'essay': essay}


@app.route('/challenge_mcq', methods=['POST'])
@jwt_required()
def challenge_mcq():
    id = get_jwt_identity()['id']
    userStateC = UserStateC.query.filter_by(id=id).first()
    if userStateC.play_state != 0:
        return {'message': 'Invalid play state'}
    essay = userStateC.essay
    difficulty = userStateC.difficulty
    event = userStateC.event
    # Generate number of mcqs based on difficulty
    # Generate and store query

    loaded_query = get_challenge_mcq(
        essay, settings.num_mcqs[difficulty], event)
#     loaded_query = {
#   "questions": [
#     {
#       "query": "What is the significance of the Mandarin oranges exchanged during Chinese New Year?",
#       "choices": [
#         "They represent unity among families.",
#         "They symbolize the arrival of spring.",
#         "They are offerings to ancestral spirits.",
#         "They ensure a bountiful harvest."
#       ],
#       "answer": 0,
#       "explanation": "The Mandarin oranges exchanged during Chinese New Year symbolize unity among families. The tradition of exchanging oranges represents the wish for prosperity and togetherness among loved ones during the festive season."
#     },
#     {
#       "query": "What do lanterns and bustling markets symbolize in Chinatown during Chinese New Year?",
#       "choices": [
#         "Unity in diversity",
#         "Modern flair",
#         "Renewal and fortune"
#       ],
#       "answer": 2,
#       "explanation": "Lanterns and bustling markets in Chinatown during Chinese New Year symbolize renewal and fortune, adding to the cherished tradition, making it the correct choice."
#     }

#   ]
# }
    # print(loaded_query["questions"])
    mcq = [{"query": k["query"], "choices": k["choices"]}
           for k in loaded_query["questions"]]
    userStateC.qns = json.dumps(mcq)
    ans = [k["answer"] for k in loaded_query["questions"]]
    userStateC.ans = json.dumps(ans)
    exp = [k["explanation"] for k in loaded_query["questions"]]
    userStateC.exp = json.dumps(exp)
    # print(mcq)
    time_start = int(time.time())
    print(time_start)
    userStateC.time_start = time_start
    userStateC.play_state = 1
    db.session.commit()
    # let frontend process dynamically based on number of questions
    return jsonify({"mcq": mcq, "time_start": time_start})


@app.route('/challenge_score_submit', methods=['POST'])
@jwt_required()
def challenge_score_submit():
    time_end = int(time.time())
    id = get_jwt_identity()['id']
    userStateC = UserStateC.query.filter_by(id=id).first()
    if userStateC.play_state != 1:
        return {'message': 'Invalid play state'}
    time_diff = time_end - userStateC.time_start
    time_diff = max(time_diff-(settings.leeway *
                    settings.num_mcqs[userStateC.difficulty]), 1)
    if time_diff > (settings.time_limits[userStateC.difficulty]+settings.epsilon):
        userStateC.play_state = -1  # reset play state
        return {'message': 'Time limit exceeded'}

    data = request.get_json()
    answers = data["answers"]
    print(answers)
    print(type(answers))
    userStateC.user_ans = json.dumps(answers)

    ans = json.loads(userStateC.ans)
    print(ans)
    exp = json.loads(userStateC.exp)
    score = 0
    for i in range(len(ans)):
        if ans[i] == answers[i]:
            score += 100

    # kahoot formula
    score = int((
        1 - ((time_diff / (settings.time_limits[userStateC.difficulty]+settings.epsilon)) / 2)) * score)
    # Update user state
    print(f"Received score: {score}")
    userStateC.challenge_score = score
    userStateC.play_state = 2
    userStateC.time_taken = time_diff
    # store all userStateC fields in ChallengeHistory

    # get existing challenge history with userid and event and difficulty
    challenge_history = ChallengeHistory.query.filter_by(user_id=id, event=userStateC.event,
                                                         difficulty=userStateC.difficulty).first()
    if challenge_history:
        # update challenge history
        if userStateC.challenge_score > challenge_history.challenge_score:
            challenge_history.challenge_score = max(
                challenge_history.challenge_score, userStateC.challenge_score)
            challenge_history.time_taken = time_diff
    else:
        challenge_history = ChallengeHistory(user_id=id, event=userStateC.event, challenge_score=userStateC.challenge_score,
                                             time_taken=time_diff, difficulty=userStateC.difficulty)
        db.session.add(challenge_history)
    db.session.commit()
    return jsonify({'message': 'Success', 'score': score, 'ans': ans, 'exp': exp, 'time_taken': time_diff})


@app.route('/challenge_events', methods=['POST'])
@jwt_required()
def challenge_events():
    # events imported
    id = get_jwt_identity()['id']
    # get the top high score of user for each events
    events = settings.all_events

    event_scores = defaultdict(lambda: defaultdict(int))
    event_played = defaultdict(bool)

    # Fetch all relevant challenge history data at once
    challenge_history = ChallengeHistory.query.filter(
        ChallengeHistory.user_id == id,
        ChallengeHistory.event.in_(settings.all_event_names),
        ChallengeHistory.difficulty.in_([1, 2, 3])
    ).all()

    # Process the fetched data
    for entry in challenge_history:
        event_scores[entry.event][entry.difficulty] = entry.challenge_score
        event_played[entry.event] = True

    # Update the events list with the processed data
    for i, event in enumerate(settings.all_event_names):
        events[i]["played"] = event_played[event]
        events[i]["easy"] = event_scores[event][1]
        events[i]["medium"] = event_scores[event][2]
        events[i]["hard"] = event_scores[event][3]

    return jsonify({"events": events, "tags": settings.tags, "total_plays": db.session.query(func.count(ChallengeHistory.event.distinct())).filter(ChallengeHistory.user_id == id).scalar()})


@app.route('/challenge_reset', methods=['POST'])
@jwt_required()
def challenge_reset():
    id = get_jwt_identity()['id']
    userStateC = UserStateC.query.filter_by(id=id).first()
    userStateC.play_state = -1
    db.session.commit()
    return {'message': 'Success'}


@app.route('/challenge_image', methods=['POST'])
@jwt_required()
def get_img_challenge():
    # return {'img': 'https://www.tripsavvy.com/thmb/M3yPlueS_BGGAPmAviQuBCIY8y8=/3133x2089/filters:fill(auto,1)/GettyImages-640271304-5c27a02646e0fb000153222b.jpg'}
    event = request.get_json()['event']
    return {'img': get_search_img(event)}


@app.route('/challenge_index', methods=['POST'])
@jwt_required()
def challenge_index():
    id = get_jwt_identity()['id']
    userStateC = UserStateC.query.filter_by(id=id).first()
    if userStateC.play_state == 2:
        return {'play_state': userStateC.play_state, 'score': userStateC.challenge_score, 'mcq': json.loads(userStateC.qns), 'ans':  json.loads(userStateC.ans), 'exp': json.loads(userStateC.exp), 'event': userStateC.event, 'difficulty': userStateC.difficulty, 'user_ans': json.loads(userStateC.user_ans), 'essay': userStateC.essay, 'time_taken': userStateC.time_taken}
    elif userStateC.play_state == 1:
        return {'play_state': userStateC.play_state, 'mcq': json.loads(userStateC.qns), 'time_start': userStateC.time_start, 'event': userStateC.event, 'difficulty': userStateC.difficulty}
    elif userStateC.play_state == 0:
        return {'play_state': userStateC.play_state, 'essay': userStateC.essay, 'event': userStateC.event, 'difficulty': userStateC.difficulty}
    else:
        return {'play_state': userStateC.play_state}


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, ssl_context=('server.crt', 'server.key'))
