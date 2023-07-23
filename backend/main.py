from flask import Flask, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message
import datetime
import os
from dotenv import load_dotenv
from flask_cors import CORS

from utils import checkPassword, checkEmail, checkUsername

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

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)

# Callback function to check if a JWT exists in the database blocklist
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()

    return token is not None


def get_reset_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

# This doesnt invalidate the link after the password is reset, but it expires in an hour
@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data['token']
        
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
        print(email)
        user = User.query.filter_by(email=email).first()
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
    email = User.query.filter_by(email=data['emailUsername']).first()
    if not email:
        user = User.query.filter_by(username=data['emailUsername']).first()
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
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'})
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'})
    
    hashed_password = generate_password_hash(data['password'], method='sha256')
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({'message': 'Email already exists'})
    user = User.query.filter_by(username=data['username']).first()
    if user:
        return jsonify({'message': 'Username already exists'})
    
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['emailUsername']).first()
    if not user:
        user = User.query.filter_by(email=data['emailUsername']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login unsuccessful'})
    access_token = create_access_token(identity={'username': user.username})
    refresh_token = create_refresh_token(identity={'username': user.username})
    return jsonify({'message':'Login successful', 'accessToken': access_token, 'refreshToken': refresh_token, 'expiresIn': expires, 'refreshTokenExpireIn': refresh_expires, 'username': user.username})

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

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    username = get_jwt_identity()
    return jsonify(logged_in_as=username)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
