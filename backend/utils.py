import re

def checkPassword(password):
    return bool(re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,120}$", password))

def checkEmail(email):
    return bool(re.match(r"""(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])""", email))

def checkUsername(username):
    return bool(re.match(r"^(?=.*[A-Za-z0-9]).{1,80}$", username))

def checkName(name):
    return bool(re.match(r"^(?=.*[A-Za-z])[A-Za-z -]{1,80}$", name))

def calc_new_rating(score, total_games, current_rating):
    """
    Calculate the rating change based on the score achieved in a single-player game using the Elo rating system.

    :param score: The score achieved in the game (out of 100).
    :param total_games: The total number of games the user has played.
    :param current_rating: The user's current rating.
    :param k_factor: The K-factor determines the sensitivity of rating changes. Default is 32.
    :return: The calculated rating change.
    """
    score -= 62.5
    k_factor = 2
    if total_games <= 10:
        k_factor = 5  # Higher K-factor for initial games
    elif total_games <= 50:
        k_factor = 3  # Lower K-factor as player becomes more established
    elif total_games <= 100:
        k_factor = 2.5
    
    expected_score = 1 / (1 + 10**((current_rating - score) / 400))
    rating_change = k_factor * (score - expected_score)
    new_rating = current_rating + rating_change

    return int(new_rating)

def parse_achievements(s):
    """Parse achievements from a string."""
    m = {}
    if s != "":
        for x in s.split(' '):
            i, j = x.split(':')
            m[int(i)] = int(j)
    return m

def format_achievements(m):
    """Format achievements into a string."""
    return ' '.join(f'{i}:{j}' for i, j in m.items())

