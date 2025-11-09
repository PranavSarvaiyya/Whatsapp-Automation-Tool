from datetime import datetime, timedelta

import time
import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# twilio credentials from environment variables
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
ACCOUNT_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

# Validate credentials
if not ACCOUNT_SID or not ACCOUNT_TOKEN:
    print("Error: Twilio credentials not found!")
    print("Please create a .env file with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN")
    exit(1)

# twilio client
client = Client(ACCOUNT_SID, ACCOUNT_TOKEN)

# function to send message
def send_message(reciptient_numbers, message_body):
    try:
        message = client.messages.create(
            to=f"whatsapp:{reciptient_numbers}",
            from_="whatsapp:+14155238886",
            body=message_body
        )
        return f"Message Sent Successfully to {message.sid}"
    except Exception as e:
        print(f"Error sending message: {e}")
        return None

# input the numbers and message body
reciptient_numbers = input("Enter the numbers with country code: ")
name = input("Enter the name: ")
message_body = input(f"Enter the message, you want to send {name}: ")

# date and time
date_string = input("Enter the date to send the message (YYYY-MM-DD): ")
time_string = input("Enter the time to send the message (HH:MM): ")

# convert date and time to datetime objects
schedule_time = datetime.strptime(f"{date_string} {time_string}", "%Y-%m-%d %H:%M")
current_time = datetime.now()

# calculate the time difference
time_difference = schedule_time - current_time
# convert in seconds
delay_seconds = time_difference.total_seconds()

if delay_seconds <= 0:
    print("The scheduled time is in the past. Please enter a future date and time.")
else:
    print(f"The message will be sent {name} in {schedule_time} seconds.")

# wait for the scheduled time
time.sleep(delay_seconds)

# send the message
print(send_message(reciptient_numbers, message_body))

