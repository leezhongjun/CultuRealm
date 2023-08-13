from main import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)

class UserProfile(db.Model):
    username = db.Column(db.String(80), db.ForeignKey('user.username'), primary_key=True, nullable=False)
    race = db.Column(db.String(80), nullable=False)
    # religion = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(80), nullable=False)
    high_score = db.Column(db.Integer)
    stories_played = db.Column(db.Integer)
    achievements = db.Column(db.String(80)) #prob a string of formatted file_paths
    profile_pic = db.Column(db.LargeBinary)
    image_style = db.Column(db.LargeBinary)

    def toDict(self):
        d = self.__dict__
        del d[next(iter(d))]
        return d
