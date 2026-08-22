from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import cv2
from models import db, User, Document
from scanner import process_image
from ocr import extract_text

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-in-prod'
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db.init_app(app)
jwt = JWTManager(app)

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"msg": "Missing username or password"}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already exists"}), 400
        
    new_user = User(username=data['username'], password=data['password']) # In prod, hash the password!
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username'), password=data.get('password')).first()
    if user:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/scan', methods=['POST'])
# @jwt_required() # Removed temporarily for easier MVP testing without auth
def scan_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # 1. Process image (Machine Vision)
        processed_image = process_image(filepath)
        
        if processed_image is None:
            return jsonify({"error": "Could not process image"}), 500
            
        # Optional: Save processed image to disk to send back to frontend
        processed_filename = f"processed_{filename}"
        processed_filepath = os.path.join(app.config['UPLOAD_FOLDER'], processed_filename)
        cv2.imwrite(processed_filepath, processed_image)
        
        # 2. Extract Text (OCR)
        ocr_result = extract_text(processed_image)
        
        extracted_text = ""
        ocr_error = None
        
        if ocr_result["success"]:
            extracted_text = ocr_result["text"]
        else:
            extracted_text = f"OCR FAILED:\n{ocr_result['error']}"
        
        # 3. Save to Database
        # current_user_id = get_jwt_identity()
        current_user_id = 1 # Dummy user ID for MVP
        
        # Ensure dummy user exists
        dummy_user = User.query.get(1)
        if not dummy_user:
            dummy_user = User(username="testuser", password="password")
            db.session.add(dummy_user)
            db.session.commit()
            
        new_doc = Document(filename=filename, extracted_text=extracted_text, user_id=1)
        db.session.add(new_doc)
        db.session.commit()
        
        return jsonify({
            "message": "Scan complete",
            "extracted_text": extracted_text,
            "document_id": new_doc.id,
            "processed_image_url": f"/uploads/{processed_filename}" # Simple static serving could be added
        }), 200

@app.route('/api/documents', methods=['GET'])
def get_documents():
    # current_user_id = get_jwt_identity()
    current_user_id = 1 # Dummy user ID for MVP
    
    docs = Document.query.filter_by(user_id=current_user_id).order_by(Document.upload_date.desc()).all()
    
    return jsonify([{
        "id": doc.id,
        "filename": doc.filename,
        "upload_date": doc.upload_date.isoformat(),
        "extracted_text": doc.extracted_text,
        "processed_image_url": f"/uploads/processed_{doc.filename}"
    } for doc in docs]), 200

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
