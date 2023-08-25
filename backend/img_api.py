import base64
import json
import time
import requests

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"


def upload_from_data(data):
    class MockFile:
        def __init__(self, filename, content):
            self.name = filename
            self.content = content

        def write(self, string):
            self.content = string

        def append(self, string):
            self.content = self.content + string

        def read(self):
            return self.content
    api_url = "https://discord-storage.animemoe.us/api/upload-from-file/"
    headers = {
        "User-Agent": USER_AGENT,
    }

    response = requests.request("POST", api_url, headers=headers, files={"file": MockFile("file.jpg", data)})
    return response.json()["url"]

def get_image(prompt: str):
    url = "https://api.fusionbrain.ai/web/api/v1/text2image/run?model_id=1"
    separator = "----WebKitFormBoundaryUpgB91wjnPesp9RK"
    edge_payload = {
        "type": "GENERATE",
        "style": "DEFAULT",
        "width": 1024,
        "height": 1024,
        "generateParams": {"query": prompt},
    }
    body = (
        f'--{separator}\r\nContent-Disposition: form-data; name="params"; filename="blob"\r\nContent-Type: application/json\r\n\r\n'
        + json.dumps(edge_payload)
        + f"\r\n--{separator}--\r\n"
    )
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Content-Type": f"multipart/form-data; boundary={separator}",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        "sec-ch-ua-mobile": "?0",
    }

    response = requests.post(url, headers=headers, data=body)
    response_1_json = response.json()
    pocket_id = response_1_json["uuid"]

    url_2_base = "https://api.fusionbrain.ai/web/api/v1/text2image/status/{}"
    headers_2 = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Host": "api.fusionbrain.ai",
        "Origin": "https://editor.fusionbrain.ai",
        "Referer": "https://editor.fusionbrain.ai/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
    }
    response_2_json = {
        "uuid": "067fb779-d9c3-4807-ad31-e0830217b020",
        "status": "INITIAL",
        "errorDescription": None,
        "images": [],
        "censored": False,
    }

    while response_2_json["status"] != "DONE" or not response_2_json["status"]:
        url_2 = url_2_base.format(pocket_id)
        response = requests.get(url_2, headers=headers_2)
        response_2_json = response.json()
        if response_2_json["status"] == "DONE" and response_2_json["status"]:
            break
        time.sleep(5)
        print(response_2_json)
    base64_image_data = response_2_json["images"][0]

    image_data = base64.b64decode(base64_image_data)
    return image_data


import requests
import os
import json

class ImageGenerator:

    def __init__(self):
        self.headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://replicate.com/stability-ai/sdxl',
                'Content-Type': 'application/json',
                'Origin': 'https://replicate.com',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'TE': 'trailers'
            }
        

    def gen_image(self, prompt, negative_prompt="", count=1, width=1024, height=1024, refine="expert_ensemble_refiner", scheduler="DDIM", guidance_scale=7.5, high_noise_frac=0.8, prompt_strength=0.8, num_inference_steps=30, image=""):
        try:
            # Check if count is within the valid range
            if count < 1 or count > 4:
                raise ValueError("Count must be between 1 and 4")

            # Check if width and height are within the valid range
            if width > 1024 or height > 1024:
                raise ValueError("Width and height must be 1024 or less")

            # Check if scheduler is valid
            valid_schedulers = ["DDIM", "DPMSolverMultistep", "HeunDiscrete", "KarrasDPM", "K_EULER_ANCESTRAL", "K_EULER", "PNDM"]
            if scheduler not in valid_schedulers:
                raise ValueError("Invalid scheduler value")

            # Check if num_inference_steps is within the valid range
            if num_inference_steps < 1 or num_inference_steps > 500:
                raise ValueError("num_inference_steps must be between 1 and 500")

            # Check if guidance_scale is within the valid range
            if guidance_scale < 1 or guidance_scale > 50:
                raise ValueError("guidance_scale must be between 1 and 50")

            # Check if prompt_strength is within the valid range
            if prompt_strength > 1:
                raise ValueError("prompt_strength must be 1 or less")

            # Check if high_noise_frac is within the valid range
            if high_noise_frac > 1:
                raise ValueError("high_noise_frac must be 1 or less")

            url = "https://replicate.com/api/models/stability-ai/sdxl/versions/2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2/predictions"

            kwargs = {} if image == "" else {"image": image}

            payload = json.dumps({
                "inputs": {
                    "width": width,
                    "height": height,
                    "prompt": prompt,
                    "refine": refine,
                    "scheduler": scheduler,
                    "num_outputs": count,
                    "guidance_scale": guidance_scale,
                    "high_noise_frac": high_noise_frac,
                    "prompt_strength": prompt_strength,
                    "num_inference_steps": num_inference_steps,
                    "negative_prompt": negative_prompt,
                    **kwargs
                }
            })

            response = requests.request("POST", url, headers=self.headers, data=payload)

            response.raise_for_status()

            json_response = response.json()
            uuid = json_response['uuid']
            image_url = self.get_image_url(uuid,prompt)

            return image_url

        except ValueError as e:
            print(f"Error: {e}")
            return None

        except requests.exceptions.RequestException as e:
            print(f"Error occurred while making the request: {e}")
            return None

        except KeyError as e:
            print(f"Error occurred while processing the response: {e}")
            return None

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return None

    def get_image_url(self, uuid,prompt):
        url = f"https://replicate.com/api/models/stability-ai/sdxl/versions/2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2/predictions/{uuid}"

        payload = {}

        response = requests.request("GET", url, headers=self.headers, data=payload).json()

        if response['prediction']['status'] == "succeeded":
            output = {"prompt":prompt,"images":response['prediction']['output_files']}
            return output
        else:
            return self.get_image_url(uuid,prompt)

