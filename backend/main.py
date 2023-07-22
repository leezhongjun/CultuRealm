from flask import Flask, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
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

basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
expires = datetime.timedelta(days=1)


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

def get_reset_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)


@app.route('/reset_password_request', methods=['POST'])
@jwt_required()
def reset_password_request():
    data = request.get_json()
    user = User.query.filter_by(email=data['emailUsername']).first()
    if not user:
        user = User.query.filter_by(username=data['emailUsername']).first()
        if not user:
            return jsonify({'message': 'email not found'})
    token = get_reset_token(user.email)
    msg = Message('Password Reset Request', 
                  sender='noreply@demo.com', 
                  recipients=[user.email])
    msg.body = f'''To reset your password, visit the following link:
{url_for('reset_password', token=token, _external=True)}
If you did not make this request then simply ignore this email and no changes will be made.
'''
    mail.send(msg)
    return jsonify({'message': 'reset password email sent'})

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
        return jsonify({'message': 'login unsuccessful'})
    access_token = create_access_token(identity={'username': user.username})
    return jsonify({'access_token': access_token})


@app.route('/reset_password/<token>', methods=['GET'])
def reset_password_get(token):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
    except:
        return jsonify({'message': 'The reset link is invalid or has expired.'})
    return jsonify({'message': 'reset password page'})

@app.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)
    except:
        return jsonify({'message': 'The reset link is invalid or has expired.'})
    user = User.query.filter_by(email=email).first()
    hashed_password = generate_password_hash(data['new_password'], method='sha256')
    user.password = hashed_password
    db.session.commit()
    return jsonify({'message': 'your password has been reset!'})

@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_token})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
