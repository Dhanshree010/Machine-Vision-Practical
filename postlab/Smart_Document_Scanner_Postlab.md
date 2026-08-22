# Post-Lab Report: Smart Document Scanner & Information Extractor

## 1. Project Overview & Real-World Context
In today's fast-paced digital environments, physical paper documents pose a bottleneck to operational efficiency. The **Smart Document Scanner & Information Extractor** is an enterprise-grade solution designed to seamlessly bridge the physical-digital gap. 

This project goes beyond a simple photo-to-text converter; it is a full-fledged web application that allows users to upload raw images of documents (e.g., receipts, invoices, contracts). The system automatically detects the document boundaries, corrects the perspective (making it look like a flat scanned page), extracts the text using Optical Character Recognition (OCR), and stores the structured data for future search, analysis, and export.

## 2. System Architecture & Technology Stack

The application follows a modern decoupled architecture, separating the client-side UI from the heavy-lifting image processing and database operations on the backend.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js | Complete single-page web interface |
| **UI Styling** | Tailwind CSS | Responsive, clean, and modern dashboard |
| **Backend** | Python + Flask | REST APIs and application logic |
| **Machine Vision** | OpenCV | Image processing, document edge detection, perspective correction |
| **OCR** | Tesseract OCR 5.x | Extracting raw text from processed document images |
| **OCR Wrapper** | `pytesseract` | Python bindings to interface with the Tesseract engine |
| **Image Processing** | NumPy | High-performance pixel and matrix operations |
| **Database** | SQLite | Storing documents, extracted text, user profiles, and scan history |
| **ORM** | SQLAlchemy | Object-Relational Mapping for database operations |
| **File Handling** | Python `os` / `pathlib` | Secure upload, storage, and management of document images |
| **API Comm.** | REST API + JSON | Seamless communication between React (Client) and Flask (Server) |
| **Charts/Stats** | Chart.js | Visualizing dashboard statistics (e.g., scans per day, document types) |
| **Authentication** | Flask-JWT-Extended | Secure token-based Admin/User login and session management |
| **Export** | ReportLab / CSV | Generating downloadable PDF reports and CSV data dumps |
| **Version Control**| Git + GitHub | Source code tracking and collaboration |
| **Deployment** | Localhost / Render | Demonstration and production deployment |

---

## 3. Core Implementation Pipeline

### 3.1. Computer Vision Module (The "Smart" Scanner)
The core of the application relies heavily on `OpenCV` and `NumPy` to process user-uploaded photos. The pipeline consists of:
1. **Grayscale & Blurring:** Convert the image to grayscale and apply a Gaussian Blur to remove noise and high-frequency details.
2. **Edge Detection:** Use the Canny Edge Detector to find the outlines of objects in the image.
3. **Contour Extraction:** Find the largest quadrilateral contour, which mathematically represents the piece of paper.
4. **Perspective Transform (Warping):** Calculate a transformation matrix to warp the angled document into a flat, top-down, 90-degree rectangle (similar to a flatbed scanner).
5. **Adaptive Thresholding:** Binarize the warped image to enhance text contrast for better OCR accuracy.

### 3.2. Optical Character Recognition (OCR)
Once the image is perfectly cropped and transformed, `pytesseract` passes the image matrix to the **Tesseract 5.x** engine. 
* Real-world enhancement: We apply custom OCR configuration flags (e.g., `--psm 6` for uniform blocks of text) depending on whether the document is a receipt, a standard letter, or a table.

### 3.3. Backend API & Database
The **Flask** backend acts as the orchestrator.
* **Authentication:** Users log in, and `Flask-JWT-Extended` issues a JWT token. All scanning endpoints are protected.
* **Storage:** Uploaded files are saved using `os`/`pathlib`, while metadata (upload date, file path, extracted text) is stored in the **SQLite** database via **SQLAlchemy**.
* **Endpoints:** REST APIs handle file uploads (`POST /api/scan`), retrieving history (`GET /api/documents`), and exporting data.

### 3.4. Frontend Dashboard
The **React.js** frontend is styled with **Tailwind CSS** to provide a premium SaaS-like feel.
* **Upload Zone:** A drag-and-drop zone for uploading images.
* **Live Preview:** Users can see the detected document edges and manually adjust the corners if the algorithm makes a slight error.
* **Analytics:** **Chart.js** displays user usage analytics (e.g., number of documents scanned this month).

---

## 4. Real-World Use Cases

1. **Expense Management:** Employees can snap photos of taxi and restaurant receipts. The system extracts the total amounts and dates, exporting them to CSV for the accounting department.
2. **Legal & Medical Records:** Quickly digitizing signed contracts or patient intake forms into searchable databases without manual data entry.
3. **Archival & Accessibility:** Converting old, fading physical books or records into digital, screen-reader-accessible formats.

---

## 5. Challenges Faced & Solutions

* **Challenge:** Lighting conditions and shadows ruining the edge detection process.
  * **Solution:** Applied adaptive thresholding (CLAHE - Contrast Limited Adaptive Histogram Equalization) before edge detection to normalize lighting across the image.
* **Challenge:** Non-standard document angles causing the OCR to output gibberish.
  * **Solution:** Built a fallback mechanism using OpenCV's `minAreaRect` to detect text skew angle and rotate the image perfectly horizontally before passing it to Tesseract.
* **Challenge:** React-to-Flask CORS (Cross-Origin Resource Sharing) issues during local development.
  * **Solution:** Configured `Flask-CORS` securely to allow the React dev server to communicate with the Flask API while maintaining security.

---

## 6. Conclusion
The Smart Document Scanner is a robust demonstration of integrating Machine Vision with modern Web Development. By leveraging OpenCV for geometric corrections and Tesseract for text extraction, wrapped in a scalable React/Flask architecture, this project serves as a highly practical tool capable of automating tedious data entry tasks in real-world business scenarios.

---

## 7. Future Enhancements

While the current iteration successfully achieves document digitization, a production-level rollout would benefit from the following upgrades:
* **Natural Language Processing (NLP):** Integrating open-source libraries like SpaCy or LLMs to intelligently parse the extracted text into structured JSON (e.g., automatically identifying "Total Amount", "Vendor Name", "Date").
* **Mobile Application:** Building a React Native counterpart to allow users to scan documents directly from their smartphone cameras with real-time edge detection feedback.
* **Cloud Storage & Database Migration:** Moving from local SQLite and file system storage to AWS S3 for document images and PostgreSQL for scalable relational data.

---

## 8. Setup & Deployment Guide

### Local Development Setup
1. **Clone the Repository:** 
   ```bash
   git clone https://github.com/your-username/smart-doc-scanner.git
   ```
2. **Backend (Python / Flask):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   flask run
   ```
   *Note: Ensure Tesseract-OCR is installed on your system and added to your environment variables.*
   
3. **Frontend (React / Tailwind):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production Deployment Strategy
* **Backend:** Deployed as a Dockerized web service on platforms like Render or Heroku.
* **Frontend:** Built statically (`npm run build`) and hosted on Vercel or Render's static web hosting.
* **Database:** Migrated to a managed PostgreSQL instance for production data integrity.
