import re

def checkPassword(password):
    return bool(re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,120}$", password))

def checkEmail(email):
    return bool(re.match(r"""(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])""", email))

def checkUsername(username):
    return bool(re.match(r"^(?=.*[A-Za-z0-9]).{1,80}$", username))

def checkName(name):
    return bool(re.match(r"^(?=.*[A-Za-z])[A-Za-z -]{1,80}$", name))

achievements = [
    {
        "name": "Helpful User",
        "description": "User offers help to another character",
        "is_achieved": False,
        "emoji": "💁"
    },
    {
        "name": "Compliment Giver",
        "description": "User gives a compliment to another character",
        "is_achieved": False,
        "emoji": "🥰"
    },
    {
        "name": "Cultural Ambassador",
        "description": "User shares their own culture",
        "is_achieved": False,
        "emoji": "🌍"
    },
    {
        "name": "Cultural Explorer",
        "description": "User asks about another character's culture",
        "is_achieved": False,
        "emoji": "🧐"
    },
    {
        "name": "Master of Laughter",
        "description": "User makes another character laugh",
        "is_achieved": False,
        "emoji": "😄"
    },
    {
        "name": "Knowledge Sharer",
        "description": "User teaches another character something new",
        "is_achieved": False,
        "emoji": "🧠"
    }
]

breakpoints = [1, 3, 5, 10, 50]