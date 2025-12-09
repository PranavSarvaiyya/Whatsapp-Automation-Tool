from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import threading
import time
import os
import sqlite3
from whatsapp_client import send_whatsapp_message
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
MONGO_URI = os.getenv("MONGO_URI")
DB_PATH = 'scheduled_messages.db'
USE_MONGO = False

# Try to connect to MongoDB if URI is present
if MONGO_URI:
    try:
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Check connection
        mongo_client.server_info()
        db = mongo_client.get_database()
        USE_MONGO = True
        print("✅ Connected to MongoDB Atlas")
    except Exception as e:
        print(f"⚠️ Could not connect to MongoDB: {e}")
        print("⚠️ Falling back to local SQLite database")
        USE_MONGO = False
else:
    print("ℹ️ No MONGO_URI found. Using local SQLite database")

# SQLite Initialization
def init_sqlite():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT NOT NULL,
            message TEXT NOT NULL,
            scheduled_time TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            tags TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    conn.commit()
    conn.close()

if not USE_MONGO:
    init_sqlite()

# --- Database Abstraction Layer ---

def db_get_pending_due_messages(current_time):
    if USE_MONGO:
        try:
            return list(db.messages.find({
                "status": "pending",
                "scheduled_time": {"$lte": current_time}
            }))
        except: return []
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, phone_number, message FROM messages WHERE status='pending' AND scheduled_time <= ?", (current_time,))
        rows = c.fetchall()
        conn.close()
        # Normalize to dict
        return [{"_id": r[0], "phone_number": r[1], "message": r[2]} for r in rows]

def db_update_message_status(msg_id, status):
    if USE_MONGO:
        db.messages.update_one({"_id": msg_id}, {"$set": {"status": status}})
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("UPDATE messages SET status=? WHERE id=?", (status, msg_id))
        conn.commit()
        conn.close()

def db_create_message(phone, message, time):
    if USE_MONGO:
        result = db.messages.insert_one({
            "phone_number": phone,
            "message": message,
            "scheduled_time": time,
            "status": "pending",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        return str(result.inserted_id)
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO messages (phone_number, message, scheduled_time) VALUES (?, ?, ?)",
                  (phone, message, time))
        conn.commit()
        msg_id = c.lastrowid
        conn.close()
        return msg_id

def db_get_all_messages():
    if USE_MONGO:
        cursor = db.messages.find().sort("created_at", -1)
        return [{
            "id": str(doc['_id']),
            "phoneNumber": doc['phone_number'],
            "message": doc['message'],
            "scheduledTime": doc['scheduled_time'],
            "status": doc.get('status', 'pending'),
            "createdAt": doc.get('created_at', '')
        } for doc in cursor]
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM messages ORDER BY created_at DESC")
        rows = c.fetchall()
        conn.close()
        return [{
            "id": row[0],
            "phoneNumber": row[1],
            "message": row[2],
            "scheduledTime": row[3],
            "status": row[4],
            "createdAt": row[5]
        } for row in rows]

def db_delete_message(msg_id):
    if USE_MONGO:
        result = db.messages.delete_one({"_id": ObjectId(msg_id)})
        return result.deleted_count > 0
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM messages WHERE id=?", (msg_id,))
        conn.commit()
        rows = c.rowcount
        conn.close()
        return rows > 0

def db_get_contacts():
    if USE_MONGO:
        cursor = db.contacts.find().sort("created_at", -1)
        return [{
            "id": str(doc['_id']),
            "name": doc['name'],
            "phoneNumber": doc['phone_number'],
            "tags": doc.get('tags', []),
            "created": doc.get('created_at', '')
        } for doc in cursor]
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM contacts ORDER BY created_at DESC")
        rows = c.fetchall()
        conn.close()
        return [{
            "id": row[0],
            "name": row[1],
            "phoneNumber": row[2],
            "tags": row[3].split(',') if row[3] else [],
            "created": row[4]
        } for row in rows]

def db_create_contact(name, phone, tags):
    if USE_MONGO:
        result = db.contacts.insert_one({
            "name": name,
            "phone_number": phone,
            "tags": tags, # List
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        return str(result.inserted_id)
    else:
        tags_str = ",".join(tags) if isinstance(tags, list) else tags
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO contacts (name, phone_number, tags) VALUES (?, ?, ?)", (name, phone, tags_str))
        conn.commit()
        cnt_id = c.lastrowid
        conn.close()
        return cnt_id

def db_delete_contact(cnt_id):
    if USE_MONGO:
        result = db.contacts.delete_one({"_id": ObjectId(cnt_id)})
        return result.deleted_count > 0
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM contacts WHERE id=?", (cnt_id,))
        conn.commit()
        rows = c.rowcount
        conn.close()
        return rows > 0

def db_get_settings():
    if USE_MONGO:
        cursor = db.settings.find()
        return {doc['key']: doc['value'] for doc in cursor}
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT key, value FROM settings")
        rows = c.fetchall()
        conn.close()
        return {row[0]: row[1] for row in rows}

def db_save_settings(data):
    if USE_MONGO:
        for key, value in data.items():
            if value is not None:
                db.settings.update_one(
                    {"key": key},
                    {"$set": {"value": str(value)}},
                    upsert=True
                )
    else:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        for key, value in data.items():
            if value is not None:
                c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(value)))
        conn.commit()
        conn.close()

# --- Core Logic ---

def process_due_messages():
    try:
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        messages = db_get_pending_due_messages(current_time)
        
        processed_count = 0
        for msg in messages:
            # Handle differnt dict structures if needed, but we normalized above
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
        # Validate time
        datetime.strptime(scheduled_time, "%Y-%m-%d %H:%M")
        
        msg_id = db_create_message(phone, message, scheduled_time)
        return jsonify({"success": True, "id": msg_id, "message": "Message scheduled successfully"})
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    process_due_messages() # Trigger poll
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
    # Normalize tags to list for internal passing, but DB handler handles str/list conversion
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
    print(f"Starting server on port 5000... (Mode: {'MongoDB' if USE_MONGO else 'SQLite'})")
    app.run(port=5000, debug=True)
