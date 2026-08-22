import pytesseract
from PIL import Image
import os
import sys

# Configure Tesseract path for Windows
if sys.platform == 'win32':
    # Local AppData installation path for Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Users\Dhanu\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'

def extract_text(image):
    """
    Takes an OpenCV image (numpy array) and extracts text using Tesseract OCR.
    """
    try:
        # Convert OpenCV image (numpy array) to PIL Image
        pil_img = Image.fromarray(image)
        # We can add custom config like psm 6 for assuming a single uniform block of text
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(pil_img, config=custom_config)
        return {"success": True, "text": text.strip()}
    except Exception as e:
        error_msg = str(e)
        if "is not installed" in error_msg or "cannot find the file" in error_msg.lower():
            error_msg = "Tesseract OCR engine is not installed on your system. Please download and install Tesseract-OCR for Windows."
        return {"success": False, "error": error_msg}
