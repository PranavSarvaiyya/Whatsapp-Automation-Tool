from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import threading
import time
import os
from whatsapp_client import send_whatsapp_message
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt
import bcrypt
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("MONGO_URI environment variable is required!")

# Connect to MongoDB
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    mongo_client.server_info()  # Test connection
    db = mongo_client.get_database()
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    raise Exception("MongoDB connection required. Please check MONGO_URI.")

# Secret Key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_12345")

@app.route('/')
def home():
    return "✅ Backend Server is Running! (Whatsapp Automation Tool - MongoDB)"

# --- Auth Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except:
            return jsonify({'error': 'Token is invalid!'}), 401
        
        return f(*args, **kwargs)
    return decorated

# --- Database Functions ---

def db_get_user(username):
    return db.users.find_one({"username": username})

def db_create_user(username, hashed_password):
    db.users.insert_one({"username": username, "password": hashed_password})

def db_get_pending_due_messages(current_time):
    try:
        return list(db.messages.find({
            "status": "pending",
            "scheduled_time": {"$lte": current_time}
        }))
    except:
        return []

def db_update_message_status(msg_id, status):
    db.messages.update_one({"_id": msg_id}, {"$set": {"status": status}})

def db_create_message(phone, message, time):
    result = db.messages.insert_one({
        "phone_number": phone,
        "message": message,
        "scheduled_time": time,
        "status": "pending",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    return str(result.inserted_id)

def db_get_all_messages():
    cursor = db.messages.find().sort("created_at", -1)
    return [{
        "id": str(doc['_id']),
        "phoneNumber": doc['phone_number'],
        "message": doc['message'],
        "scheduledTime": doc['scheduled_time'],
        "status": doc.get('status', 'pending'),
        "createdAt": doc.get('created_at', '')
    } for doc in cursor]

def db_delete_message(msg_id):
    result = db.messages.delete_one({"_id": ObjectId(msg_id)})
    return result.deleted_count > 0

def db_get_contacts():
    cursor = db.contacts.find().sort("created_at", -1)
    return [{
        "id": str(doc['_id']),
        "name": doc['name'],
        "phoneNumber": doc['phone_number'],
        "tags": doc.get('tags', []),
        "created": doc.get('created_at', '')
    } for doc in cursor]

def db_create_contact(name, phone, tags):
    result = db.contacts.insert_one({
        "name": name,
        "phone_number": phone,
        "tags": tags,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    return str(result.inserted_id)

def db_delete_contact(cnt_id):
    result = db.contacts.delete_one({"_id": ObjectId(cnt_id)})
    return result.deleted_count > 0

def db_get_settings():
    cursor = db.settings.find()
    return {doc['key']: doc['value'] for doc in cursor}

def db_save_settings(data):
    for key, value in data.items():
        if value is not None:
            db.settings.update_one(
                {"key": key},
                {"$set": {"value": str(value)}},
                upsert=True
            )

# --- Auth Routes ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if db_get_user(username):
        return jsonify({'error': 'Username already exists'}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    db_create_user(username, hashed_pw.decode('utf-8'))
    
    return jsonify({'success': True, 'message': 'User created successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = db_get_user(username)
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({
            'user': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({'token': token})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/verify-token', methods=['GET'])
@token_required
def verify_token():
    return jsonify({'valid': True})

@app.route('/api/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Both passwords are required'}), 400
    
    # Get username from token
    token = request.headers.get('Authorization').split(" ")[1]
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    username = payload.get('user')
    
    # Verify current password
    user = db_get_user(username)
    if not user or not bcrypt.checkpw(current_password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    db.users.update_one(
        {"username": username},
        {"$set": {"password": hashed_pw.decode('utf-8')}}
    )
    
    return jsonify({'success': True, 'message': 'Password updated successfully'})

# --- Core Logic ---

def process_due_messages():
    try:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
        messages = db_get_pending_due_messages(current_time)
        
        processed_count = 0
        for msg in messages:
            msg_id = msg['_id']
            phone = msg['phone_number']
            text = msg['message']
            
            print(f"Processing message to {phone}: {text}")
            sid = send_whatsapp_message(phone, text)
            
            status = 'sent' if sid else 'failed'
            db_update_message_status(msg_id, status)
            processed_count += 1
            
        return processed_count
    except Exception as e:
        print(f"Scheduler error: {e}")
        return 0

def check_schedule():
    while True:
        process_due_messages()
        time.sleep(30)

# Start scheduler
scheduler_thread = threading.Thread(target=check_schedule, daemon=True)
scheduler_thread.start()

# --- API Routes ---

@app.route('/api/schedule', methods=['POST'])
def schedule_message():
    data = request.json
    phone = data.get('phoneNumber')
    message = data.get('message')
    scheduled_time = data.get('scheduledTime')
    
    if not all([phone, message, scheduled_time]):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        datetime.strptime(scheduled_time, "%Y-%m-%d %H:%M")
        msg_id = db_create_message(phone, message, scheduled_time)
        return jsonify({"success": True, "id": msg_id, "message": "Message scheduled successfully"})
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    process_due_messages()
    try:
        messages = db_get_all_messages()
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages/<id>', methods=['DELETE'])
def delete_message(id):
    try:
        success = db_delete_message(id)
        if success:
            return jsonify({"success": True})
        return jsonify({"error": "Message not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    try:
        contacts = db_get_contacts()
        return jsonify(contacts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts', methods=['POST'])
def add_contact():
    data = request.json
    name = data.get('name')
    phone = data.get('phoneNumber')
    tags_raw = data.get('tags', [])
    tags = tags_raw if isinstance(tags_raw, list) else str(tags_raw).split(',')

    if not all([name, phone]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cnt_id = db_create_contact(name, phone, tags)
        return jsonify({"success": True, "id": cnt_id})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts/<id>', methods=['DELETE'])
def delete_contact(id):
    try:
        success = db_delete_contact(id)
        if success:
            return jsonify({"success": True})
        return jsonify({"error": "Contact not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET'])
def get_settings():
    try:
        settings = db_get_settings()
        return jsonify(settings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    try:
        db_save_settings(request.json)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"Starting server on port 5000... (Mode: MongoDB)")
    app.run(port=5000, debug=True)
