from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import threading
import time
import sqlite3
import os
from whatsapp_client import send_whatsapp_message

app = Flask(__name__)
CORS(app)

import shutil

app = Flask(__name__)
CORS(app)

# Vercel handling: Copy DB to /tmp to allow write access (ephemeral)
DB_SOURCE = os.path.join(os.path.dirname(__file__), 'scheduled_messages.db')
DB_PATH = '/tmp/scheduled_messages.db'

def init_db():
    # Only copy if it doesn't exist in /tmp yet (or always copy if we want to reset/load seed)
    if not os.path.exists(DB_PATH):
        if os.path.exists(DB_SOURCE):
            shutil.copy2(DB_SOURCE, DB_PATH)
        else:
            # Create a new empty db if source missing
            conn = sqlite3.connect(DB_PATH)
            conn.close()

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

init_db()

def check_schedule():
    while True:
        try:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M")
            
            # Find pending messages that are due or past due
            c.execute("SELECT id, phone_number, message FROM messages WHERE status='pending' AND scheduled_time <= ?", (current_time,))
            messages = c.fetchall()
            
            for msg in messages:
                msg_id, phone, text = msg
                print(f"Sending scheduled message to {phone}: {text}")
                sid = send_whatsapp_message(phone, text)
                
                status = 'sent' if sid else 'failed'
                c.execute("UPDATE messages SET status=? WHERE id=?", (status, msg_id))
                conn.commit()
                
            conn.close()
        except Exception as e:
            print(f"Scheduler error: {e}")
            
        time.sleep(30) # Check every 30 seconds

# Start scheduler in background thread
scheduler_thread = threading.Thread(target=check_schedule, daemon=True)
scheduler_thread.start()

@app.route('/api/schedule', methods=['POST'])
def schedule_message():
    data = request.json
    phone = data.get('phoneNumber')
    message = data.get('message')
    scheduled_time = data.get('scheduledTime') # Expected format: YYYY-MM-DD HH:MM
    
    if not all([phone, message, scheduled_time]):
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        # Validate time format
        datetime.strptime(scheduled_time,("%Y-%m-%d %H:%M"))
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO messages (phone_number, message, scheduled_time) VALUES (?, ?, ?)",
                  (phone, message, scheduled_time))
        conn.commit()
        msg_id = c.lastrowid
        conn.close()
        
        return jsonify({"success": True, "id": msg_id, "message": "Message scheduled successfully"})
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM messages ORDER BY created_at DESC")
        rows = c.fetchall()
        
        messages = []
        for row in rows:
            messages.append({
                "id": row[0],
                "phoneNumber": row[1],
                "message": row[2],
                "scheduledTime": row[3],
                "status": row[4],
                "createdAt": row[5]
            })
        conn.close()
        return jsonify(messages)
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages/<int:id>', methods=['DELETE'])
def delete_message(id):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM messages WHERE id=?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT * FROM contacts ORDER BY created_at DESC")
        rows = c.fetchall()
        contacts = []
        for row in rows:
            contacts.append({
                "id": row[0],
                "name": row[1],
                "phoneNumber": row[2],
                "tags": row[3].split(',') if row[3] else [],
                "created": row[4]
            })
        conn.close()
        return jsonify(contacts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts', methods=['POST'])
def add_contact():
    data = request.json
    name = data.get('name')
    phone = data.get('phoneNumber')
    tags = ",".join(data.get('tags', []))

    if not all([name, phone]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO contacts (name, phone_number, tags) VALUES (?, ?, ?)", (name, phone, tags))
        conn.commit()
        cnt_id = c.lastrowid
        conn.close()
        return jsonify({"success": True, "id": cnt_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacts/<int:id>', methods=['DELETE'])
def delete_contact(id):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM contacts WHERE id=?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET'])
def get_settings():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT key, value FROM settings")
        rows = c.fetchall()
        settings = {row[0]: row[1] for row in rows}
        conn.close()
        return jsonify(settings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    data = request.json
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        for key, value in data.items():
            c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(port=5000, debug=True)
