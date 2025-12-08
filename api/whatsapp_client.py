import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_twilio_client():
    # twilio credentials
    ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
    ACCOUNT_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
    
    if not ACCOUNT_SID or not ACCOUNT_TOKEN:
        print("Error: Twilio credentials not found in environment variables!")
        return None
        
    return Client(ACCOUNT_SID, ACCOUNT_TOKEN)

# function to send message
def send_whatsapp_message(recipient_number, message_body):
    client = get_twilio_client()
    if not client:
        return None
        
    try:
        # Clean the number
        clean_number = recipient_number.replace(" ", "").replace("-", "")
        
        # Add default country code (+91) if missing
        if not clean_number.startswith("+"):
            clean_number = f"+91{clean_number}"
            
        # Ensure format is whatsapp:+91xxxxxxxxxx
        to_number = f"whatsapp:{clean_number}"
        
        message = client.messages.create(
            to=to_number,
            from_="whatsapp:+14155238886",
            body=message_body
        )
        return message.sid
    except Exception as e:
        print(f"Error sending message: {e}")
        return None
