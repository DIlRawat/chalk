import requests
import base64
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

BASE_URL = "http://localhost:8000"

def create_test_image(text="A"):
    # Create a white image
    img = Image.new('RGB', (200, 200), color='white')
    d = ImageDraw.Draw(img)
    # Draw text (black)
    # Use default font if no font file available
    d.text((50, 50), text, fill=(0, 0, 0))
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

def test_get_characters():
    print("Testing /get-characters...")
    try:
        response = requests.post(f"{BASE_URL}/get-characters", json={"language": "English"})
        if response.status_code == 200:
            print("Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_check_ocr():
    print("\nTesting /check-ocr...")
    image_b64 = create_test_image("A")
    
    try:
        response = requests.post(f"{BASE_URL}/check-ocr", json={
            "image": image_b64,
            "expected_character": "A"
        })
        if response.status_code == 200:
            print("Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_characters()
    test_check_ocr()
