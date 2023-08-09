import openai
from dotenv import load_dotenv
import os
import json

from img_api import get_image
from utils import achievements, breakpoints
import time

load_dotenv()

openai.api_base = "https://chimeragpt.adventblocks.cc/api/v1"
openai.api_key = os.getenv("OPENAI_API_KEY")

styles = {
    "Photorealistic": "realistic, highly detailed, art-station, trending on artstation, masterpiece, great artwork, ultra render realistic n-9, 4k UHD, 8k, 16k, 20k, octane render, stunning detail",
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
        allow_fallback=True,
        **kwarg
    )
    return response.choices[0].message.content

def ask_gpt_convo(messages):
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=messages,
        allow_fallback=True
    )
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
    retry = True
    while retry:
        try:
            res = ask_gpt(prompt)
            res = res.split("[")[-1].split("]")[0]
            res = "[" + res + "]"
            res = eval(res)
            retry = False
        except:
            pass
    return res

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
    return ask_gpt_convo(messages)


def get_start_img(text, style):
    prompt = f"""There is an image that accompanies the text in the story. 

STORY:
{text}

An adult that just saw the image without reading the story. Describe what the adult saw in simple English, in a single sentence, and include the races, ages, and genders of the people in the description. Do not include character names. Use simple sentence structure. Start the description with "An image of ..."
"""
    img_prompt = ask_gpt(prompt) + " " + styles[style]
    retry = True
    while retry:
        try:
            response = openai.Image.create(
                prompt=img_prompt,
                n=1,  # images count
                size="1024x1024"
            )
            return response["data"][0]["url"]
        except:
            pass

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
    
    resp = ask_gpt(prompt, temp=1)
    print(resp)
    res = []
    for r in resp.split('\n'):
        if "Do: " in r:
            res.append("Do: " + r.split("Do: ")[-1])
        elif "Say: " in r:
            res.append("Say: " + r.split("Say: ")[-1])
    return res

def get_keywords(text):
    prompt = f"""Extract only very specific and important cultures, cultural activities, cultural events, cultural festivals, cultural customs, cultural traditions and cultural items from the following text. There might be none. Return it as a Python list.

Follow this format for the output: ["...", "..."]

Text:
{text}
"""
    res = ask_gpt(prompt, temp=0)
    if "[" not in res:
        return []
    res = "[" + res.split('[')[-1].split(']')[0] + "]"
    return eval(res)