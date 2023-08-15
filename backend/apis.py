import openai
from dotenv import load_dotenv
import os
import json

from img_api import get_image, upload_from_data
from settings import achievements, breakpoints
import time

load_dotenv()

openai.api_base=os.environ['OPENAI_API_BASE_2']
openai.api_key=os.environ['OPENAI_API_KEY_2']

styles = {
    "Photorealistic": "realistic, highly detailed, art-station, trending on artstation, masterpiece, great artwork, ultra render realistic n-9, 4k, 8k, 16k, 20k",
    "Pixel": "16 bit pixel art, cinematic still, hdr, pixelated full body, character icon concept art, pixel perfect",
    "Cartoon": "cartoon, intricate, sharp focus, illustration, highly detailed, digital painting, concept art, matte, art by wlop and artgerm and ivan shishkin and andrey shishkin, masterpiece",
    "Anime": "anime, digital art, trending on artstation, pixiv, hyperdetailed, 8k realistic, symmetrical, high coherence, depth of field, very coherent artwork"
}

def ask_gpt(prompt, max_tokens=0, temp=-1):
    kwarg = {"max_tokens": max_tokens} if max_tokens else {}
    if temp >= 0:
        kwarg["temperature"] = temp
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=[
            {'role': 'user', 'content': prompt},
        ],
        allow_fallback=False,
        **kwarg
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content

def ask_gpt_convo(messages):
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=messages,
        allow_fallback=False
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content

def get_story_seeds(age, gender, race):
    if gender == "Unspecified":
        gender = ""
    else:
        gender = gender.strip().lower() + " "
    if race == "Unspecified":
        race = ""
    else:
        race = race.strip().capitalize() + " "
    if age == "Unspecified":
        age = ""
    else:
        age = f"a {age} year old "
    prompt = f"""Generate summaries of 10 different cultural scenarios set in Singapore where the user, {age}{gender}{race}who is a Singapore citizen can interact with one or more people from different cultures. Each cultural scenario should test the user, {age}{gender}{race}who is a Singaporean citizen on his ability to interact, respect and appreciate different cultures. Each summary should be less than 3 sentences. Refer to the user in the summary.

List the summaries as a Python list. Follow the format strictly.
Example Format: 
["...", ... ]"""
    while True:
        try:
            res = ask_gpt(prompt, temp=2)
            res = res.split("[")[-1].split("]")[0]
            res = "[" + res + "]"
            res = eval(res)
            return res
        except:
            pass

def get_story_seed(age, gender, race):
    if gender == "Unspecified":
        gender = ""
    else:
        gender = gender.strip().lower() + " "
    if race == "Unspecified":
        race = ""
    else:
        race = race.strip().capitalize() + " "
    if age == "Unspecified":
        age = ""
    else:
        age = f"a {age} year old "
    prompt = f"""Generate summaries of 2 different cultural scenarios set in Singapore where the user, {age}{gender}{race}who is a Singapore citizen can interact with one or more people from different cultures. Each cultural scenario should test the user, {age}{gender}{race}who is a Singaporean citizen on his ability to interact, respect and appreciate different cultures. Each summary should be less than 3 sentences. Refer to the user in the summary.

List the summaries as a Python list. Follow the format strictly.
Example Format: 
["...", ... ]"""
    try:
        res = ask_gpt(prompt, temp=2)
        res = res.split("[")[-1].split("]")[0]
        res = "[" + res + "]"
        res = eval(res)
        return res[-1]
    except:
        pass

def get_story_title(seed):
    prompt = f"""Generate a title for a story based on the following summary.

Summary:
{seed}

Follow the output format strictly.
Example Output Format:
Title: ..."""
    try:
        res = ask_gpt(prompt, temp=1)
        return res.split("Title: ")[-1].replace('"', '').replace("'", "")
    except:
        pass

def system_prompt(seed, name, age, race, gender):
    if gender == "Unspecified":
        gender = ""
    else:
        gender = gender.strip().lower() + " "
    if race == "Unspecified":
        race = ""
    else:
        race = race.strip().capitalize() + " "
    if age == "Unspecified":
        age = ""
    else:
        age = f"{age} year old "
    system = f"""You will act as a text-based RPG that will place the user, {name.capitalize()}, a {age}local {race}{gender}in a storyline that is set in Singapore and is non-fictional. The storyline will test the user's ability to interact with people from different cultures and respect different cultures. The storyline is cohesive and has characters that will persist throughout the story.


In the RPG, the user can act freely to test their cultural awareness and ability to interact with other cultures by giving open ended responses to guide the storyline.


Use the user's responses to guide the storyline without modifying the user's responses.


The user will be able to give keep responses before the RPG ends.


When the user says "STORY ENDS THIS TURN" after his response, describe the ending of the story and do not ask the user for a response.
Do not abruptly end without describing the ending of the story.


This is the summary of the storyline for the RPG:
{seed}


Start the RPG. Start it directly by introducing the scene and context. Do not ask if the user is ready to start after the user gives the summary of the storyline. Remember to ask the user for his response."""
    return system

def get_start_story(seed, name, age, race, gender):
    messages = [
        {"role": "system", "content": system_prompt(seed, name, age, race, gender)}
    ]
    return ask_gpt_convo(messages).replace("*", ""), messages[0] # remove all asterisks


def get_start_img_prompt(text):
    prompt = f"""There is an image that accompanies the text in the story. 

STORY:
{text}

An adult that just saw the image without reading the story. Describe what the adult saw in simple English, in a single sentence, and include the races, ages, and genders of the people in the description. Do not include character names. Use simple sentence structure. Start the description with "An image of ..."
"""
    img_prompt = ask_gpt(prompt)
    
    return img_prompt

def get_suggestions(text):
    prompt = f"""Generate 2 possible user responses for this story. Follow the format specified.

Example output 1:
Option 1: Say: [user speech in response]
Option 2: Do: [user action in response]

Example output 2:
Option 1: Do: [user action in response]
Option 2: Say: [user speech in response]


STORY:
{text}
"""
    
    res = []
    while len(res) < 2:
        res = []
        try:
            resp = ask_gpt(prompt, temp=1)
            for r in resp.split('\n'):
                s = ''
                if "Do: " in r:
                    s = "Do: " + r.split("Do: ")[-1]
                elif "Say: " in r:
                    s = "Say: " + r.split("Say: ")[-1]
                if s.strip():
                    res.append(s)
        except:
            pass
    
    return res

def get_keywords(text):
    prompt = f"""Extract only very specific and important cultures, religions, cultural and religious from the following text. There might be none. Return it as a Python list.

Follow this format for the output: ["...", "..."]

Text:
{text}
"""
    res = ask_gpt(prompt, temp=0)
    if "[" not in res:
        return []
    res = "[" + res.split('[')[-1].split(']')[0] + "]"
    return eval(res)

def gen_img(prompt, style):
    while True:
        try:
            res = get_image(prompt + " " + styles[style])
            img = res
            return upload_from_data(img)
        except:
            pass


def moderate_input(user_input):
    openai.api_base=os.environ['OPENAI_API_BASE']
    openai.api_key=os.environ['OPENAI_API_KEY']
    response = openai.Moderation.create(
        input=user_input
    )
    openai.api_base=os.environ['OPENAI_API_BASE_2']
    openai.api_key=os.environ['OPENAI_API_KEY_2']
    cat = []
    for k in response['results'][0]['categories'].keys():
        if response['results'][0]['categories'][k]:
            cat.append(k)
    return response['results'][0]['flagged'], cat


def get_feedback_and_score(user_response, text):
    prompt = f"""Evaluate the following USER RESPONSE to the STORY CONTEXT based on how well the user respected and appreciated other cultures if the scenario gives the user a chance to do so. Let's think step by step. Then, rate the response on a scale of 1 to 100 based on the same basis.

Example output:
EXPLANATION: [explanation]

SCORE: [score]/100

STORY CONTEXT:
{text}

USER RESPONSE:
{user_response}
"""
    score = ''
    explanation = ''
    while score == '' or explanation == '':
        try:
            res = ask_gpt(prompt, temp=0)
            reses = res.split("EXPLANATION: ")[-1].split("SCORE: ")
            score = reses[-1].split("/100")[0]
            explanation = reses[0].strip()
        except:
            pass
    try:
        score = int(score)
    except:
        score = 0
    return explanation, score

def get_opportunity_score(name, text):
    prompt = f'''Rate the quality and quantity of opportunities given to demonstrate their ability to respect and appreciate other cultures to the user, {name}, during the following STORY CONTEXT on a scale of 1 to 100.

Example output:
SCORE: [score]/100

STORY CONTEXT:
{text}
'''
    score = ''
    while score == '':
        try:
            res = ask_gpt(prompt, temp=0, max_tokens=10)
            score = res.split("SCORE: ")[-1].split("/100")[0]
        except:
            pass
    try:
        score = int(score)
    except:
        score = 90
    return score

def get_achievements_score(name, text, user_response):
    prompt = f"""Text:
{text}

The user's name is {name}.
    
User Response:
{user_response}

Questions:
1. Did the user offer help to another character in the user response?
2. Did the user give a compliment to another character in the user response?
3. Did the user share their own culture in the user response?
4. Did the user directly ask about another character's culture in the user response?
5. Did the user make another character laugh?

Answer the above questions based on the TEXT and USER RESPONSE provided.  

Let's think step by step. Explain each answer step by step. 

Then, output it as a formatted JSON list.

Example output:
[true/false, true/false, true/false, true/false, true/false]
{text}

USER RESPONSE: 
{user_response}
"""
    while True:
        try:
            res = ask_gpt(prompt, temp=0)
            res = json.loads("[" + res.split("[")[-1].split(']')[0] + "]")
            print(res)
            ls =[]
            for i, x in enumerate(res):
                if x:
                    ls.append(i)
            return ls
        except:
            pass