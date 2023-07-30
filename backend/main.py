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

from utils import checkPassword, checkEmail, checkUsername
import settings

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
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(120), nullable=False)

    race = db.Column(db.String(80), nullable=False)
    religion = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(80), nullable=False)
    age = db.Column(db.String(16), nullable=False)
    high_score = db.Column(db.Integer)
    stories_played = db.Column(db.Integer)
    achievements = db.Column(db.String(80)) #prob a string of formatted file_paths
    profile_pic = db.Column(db.LargeBinary)
    image_style = db.Column(db.String(16))

    def toDict(self):
        d = self.__dict__
        del d[next(iter(d))]
        return d
    

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

    # check if password, confirm_password, email, and username are valid
    if checkPassword(data['password']) == False:
        return jsonify({'message': 'Password must be 8-30 characters long, contain at least one letter, one number, and one special character'})
    if checkEmail(data['email']) == False:
        return jsonify({'message': 'Invalid email'})
    if checkUsername(data['username']) == False:
        return jsonify({'message': 'Invalid username'})
    
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
    
    new_user_profile = UserProfile(username=data['username'], email=data['email'], password=hashed_password, id=str(uuid.uuid4()), **settings.default_user_profile)
    db.session.add(new_user_profile)
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
@jwt_required()
def get_profile_pic():
    id = get_jwt_identity()['id']
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
        user_profile.age = data['age']
        user_profile.race = data['race']
        user_profile.religion = data['religion']
        user_profile.gender = data['gender']
        user_profile.image_style = data['image_style']
        user_profile.username = data['username']
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
    res['email'] = user_profile.email
    res['profile_pic'] = None

    return res

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

