from flask import Flask, request, jsonify
import pickle
import re
import ssl
import socket
from urllib.parse import urlparse

app = Flask(__name__)

# Load the trained model
with open('phishing_detection_model.pkl', 'rb') as file:
    model = pickle.load(file)

# Load the scaler
with open('scaler.pkl', 'rb') as file:
    scaler = pickle.load(file)

def url_length(url):
    return len(url)

def suspicious_words(url):
    suspicious = {'login', 'signin', 'verify', 'banking', 'account', 'secure', 'facbok', 'faceb0ok'}
    url_words = re.findall('\w+', urlparse(url).netloc + urlparse(url).path)
    count = 0
    for word in url_words:
        if word.lower() in suspicious:
            count += 1
    return count

special_char_pattern = re.compile('[!@#$%^&*(),.?":{}|<>]')

def special_characters(url):
    return len(special_char_pattern.findall(url))

def has_valid_ssl(url):
    try:
        hostname = url.split('//')[1].split('/')[0]
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as sslsock:
                return True
    except (ssl.SSLError, socket.error):
        return False

def domain_length(url):
    domain = urlparse(url).netloc
    return len(domain)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data['url']
    features = {
        'url_length': url_length(url),
        'suspicious_words': suspicious_words(url),
        'special_characters': special_characters(url),
        'has_valid_ssl': has_valid_ssl(url),
        'domain_length': domain_length(url)
    }
    scaled_features = scaler.transform([list(features.values())])
    prediction = model.predict(scaled_features)[0]
    prediction_label = "phishing" if prediction == 1 else "legitimate"
    return jsonify({'prediction': prediction_label})

if __name__ == '__main__':
    app.run(debug=True)
