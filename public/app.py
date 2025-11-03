from flask import Flask, request, jsonify
import requests
import base64
from datetime import datetime
from requests.auth import HTTPBasicAuth

app = Flask(__name__)

# M-Pesa API Credentials
CONSUMER_KEY = "YOUR_CONSUMER_KEY"
CONSUMER_SECRET = "YOUR_CONSUMER_SECRET"
BUSINESS_SHORTCODE = "174379"  # Sandbox Shortcode
PASSKEY = "YOUR_PASSKEY"
CALLBACK_URL = "https://yourwebsite.com/callback"

# Function to get M-Pesa Access Token
def get_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(url, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET))
    return response.json().get("access_token")

# Route to process M-Pesa STK Push
@app.route("/mpesa-stk", methods=["POST"])
def stk_push():
    data = request.json
    phone = data["phoneNumber"]
    amount = data["amount"]

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode((BUSINESS_SHORTCODE + PASSKEY + timestamp).encode()).decode()

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "KimathiMarket",
        "TransactionDesc": "Cart Payment"
    }

    headers = {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json"
    }

    response = requests.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", json=payload, headers=headers)
    
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)
