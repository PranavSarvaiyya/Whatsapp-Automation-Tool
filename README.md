# WhatsApp Automation Tool

A Python tool to schedule and send WhatsApp messages using Twilio API.

## Features

- Schedule WhatsApp messages for future date and time
- Send messages to any WhatsApp number (with proper Twilio setup)
- Simple command-line interface

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
   - Create a `.env` file
   - Add your Twilio credentials:
     ```
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     ```

3. Run the script:
```bash
python main.py
```

## Requirements

- Python 3.x
- Twilio account with WhatsApp API access
- Valid Twilio credentials

## Note

This tool uses Twilio WhatsApp Sandbox for testing. For production use, you need to set up Twilio WhatsApp Business API.

