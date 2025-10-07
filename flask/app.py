from flask import Flask, request, jsonify
import pickle
import json
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# Load model and columns
with open('bangalore_home_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('columns.json', 'r') as f:
    data_columns = json.load(f)['data_columns']

@app.route('/')
def home():
    return "🏠 Bangalore House Price Prediction API is Running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    location = data.get('location').lower()
    sqft = float(data.get('sqft'))
    bath = int(data.get('bath'))
    bhk = int(data.get('bhk'))

    try:
        loc_index = data_columns.index(location)
    except ValueError:
        loc_index = -1

    x = np.zeros(len(data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    predicted_price = round(model.predict([x])[0], 2)
    print(predicted_price)
    return jsonify({"predicted_price_lakh": predicted_price})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
