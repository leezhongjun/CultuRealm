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
    base64_image_data = response_2_json["images"][0]

    image_data = base64.b64decode(base64_image_data)
    return image_data

