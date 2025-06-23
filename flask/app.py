
from flask import Flask, request, jsonify
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
import pandas as pd
from torch_geometric.nn import GATConv
#cors
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

model_path = "saved_model.pth"

df = pd.read_csv("Healthcare Providers.csv")

# Step 2: Data Preprocessing (as already done)
df["Average Medicare Allowed Amount"] = pd.to_numeric(df["Average Medicare Allowed Amount"], errors='coerce')
df["Average Submitted Charge Amount"] = pd.to_numeric(df["Average Submitted Charge Amount"], errors='coerce')

# Create fraud label (1 for fraud, 0 for non-fraud) based on threshold
threshold = 1.5
df['fraud'] = (df["Average Submitted Charge Amount"] / df["Average Medicare Allowed Amount"] > threshold).astype(int)

# Step 5: Prepare Data for the GAT model
import numpy as np
# Feature columns for the graph model
feature_cols = [
    "Number of Services",
    "Number of Medicare Beneficiaries",
    "Average Medicare Allowed Amount",
    "Average Submitted Charge Amount",
    "Average Medicare Payment Amount",
    "Average Medicare Standardized Amount"
]

# Ensure feature columns are numeric and handle missing values
for col in feature_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing feature values with 0
df[feature_cols] = df[feature_cols].fillna(0)

# Extract node features as a NumPy array
node_features = df[feature_cols].values.astype(float)

# Labels for fraud prediction
labels = df['fraud'].values

# Graph construction with edges (using HCPCS code as group and creating edges within the group)
edge_list = []
max_edges_per_group = 1000  # Maximum unique pairs (edges) to sample per HCPCS group


# Group by HCPCS Code and create bidirectional edges for each unique pair within the group.
for code, group in df.groupby("HCPCS Code"):
    indices = group.index.tolist()
    n = len(indices)
    num_possible_edges = n * (n - 1) // 2
    if num_possible_edges > max_edges_per_group:
        # Sample a set of unique pairs randomly
        sampled_pairs = set()
        while len(sampled_pairs) < max_edges_per_group:
            i, j = np.random.choice(indices, 2, replace=False)
            pair = tuple(sorted((i, j)))
            sampled_pairs.add(pair)
        # Add each sampled pair bidirectionally
        for i, j in sampled_pairs:
            edge_list.append([i, j])
            edge_list.append([j, i])
    else:
        # Use full connectivity for small groups
        for i in range(n):
            for j in range(i + 1, n):
                edge_list.append([indices[i], indices[j]])
                edge_list.append([indices[j], indices[i]])

# Convert edge list to tensor
edge_index = torch.tensor(np.array(edge_list).T, dtype=torch.long)


# Step 8: Define GAT Model
class GAT(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, args):
        super(GAT, self).__init__()
        self.conv1 = GATConv(input_dim, hidden_dim, heads=args['heads'])
        self.conv2 = GATConv(args['heads'] * hidden_dim, hidden_dim, heads=args['heads'])
        self.post_mp = torch.nn.Sequential(
            torch.nn.Linear(args['heads'] * hidden_dim, hidden_dim),
            torch.nn.Dropout(args['dropout']),
            torch.nn.Linear(hidden_dim, output_dim)
        )

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.post_mp(x)
        return torch.sigmoid(x)

# Step 9: Initialize the Model
args = {
    "epochs": 100,
    "lr": 0.01,
    "weight_decay": 1e-5,
    "heads": 2,
    "hidden_dim": 128,
    "dropout": 0.5
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = GAT(6, args['hidden_dim'], 1, args).to(device)

 #3: Define a function to get the allowed amount for a given HCPCS code
def get_allowed_amount(service_description, df):
    """
    Retrieves the allowed amount for the given HCPCS Description from the dataset,
    handling variations in spacing and capitalization.
    """
    # Normalize the dataset and input
    df["HCPCS Description"] = df["HCPCS Description"].str.strip().str.lower()
    service_description = service_description.strip().lower()

    row = df[df["HCPCS Description"] == service_description]
    if not row.empty:
        return row["Average Medicare Allowed Amount"].values[0]
    else:
        print(f"Service description '{service_description}' not found. Returning 0.")
        return 0
def predict_fraud(service_description, paid_amount, df, threshold=1.5):
    """
    Predict fraud or non-fraud for a given service code and paid amount.
    """
    allowed_amount = get_allowed_amount(service_description, df)

    # If allowed amount is 0, return invalid prediction
    if allowed_amount == 0:
        return "Invalid Service Code", 0

    # Calculate the ratio of paid to allowed amount
    ratio = paid_amount / allowed_amount

    # If the ratio is greater than the fraud threshold, classify as fraud
    if ratio > threshold:
        return "Fraud", ratio
    else:
        return "Non-Fraud", ratio
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        service_description = data['service_description']
        paid_amount = float(data['paid_amount'])
        
        # Step 1: HCPCS Code-Based Prediction with Adjusted Threshold
        threshold_hcpcs = 1.5  # Adjust threshold to classify non-fraud
        fraud_status_hcpcs, fraud_ratio = predict_fraud(service_description, paid_amount, df, threshold_hcpcs)


        print(f"HCPCS Code-Based Prediction (Adjusted Threshold):")
        print(f"Service description: {service_description}")
        print(f"Paid amount: {paid_amount}")
        print(f"Prediction: {fraud_status_hcpcs} with paid-to-allowed ratio of {fraud_ratio:.2f}")
        # Call the prediction function
        model.eval()
        with torch.no_grad():
            # Retrieve the node index for the service code (HCPCS code '99213')
            # Check if the service description exists in the DataFrame
            if service_description in df['HCPCS Description'].values:
                service_index = df[df['HCPCS Description'] == service_description].index[0]
                node_feature = df.loc[service_index, feature_cols].values.astype(float)
                node_feature = torch.tensor(node_feature, dtype=torch.float).unsqueeze(0).to(device)

                edge_index = torch.tensor([[], []], dtype=torch.long).to(device)
                data_example = Data(x=node_feature, edge_index=edge_index, y=torch.tensor([df['fraud'][service_index]], dtype=torch.float).to(device))

                out = model(data_example)
                pred_prob = out.squeeze().item()
                pred_label = 1 if pred_prob > 0.5 else 0  # Use threshold for prediction

                print(f"GAT Model-Based Prediction for Service '{service_description}':")
                print(f"Prediction: {'Fraud' if pred_label == 1 else 'Non-Fraud'} with predicted probability of {pred_prob:.2f}")
            else:
                print(f"Service description '{service_description}' not found in the dataset.")

        
        return {
        "GAT Prediction": {
            "service_code": service_description,
            "paid_amount": paid_amount,
            "prediction": 'Fraud' if pred_label == 1 else 'Non-Fraud',
            "predicted_probability": round(pred_prob, 2)
        },
        "HCPCS": {
            "service_code": service_description,
            "paid_amount": paid_amount,
            "prediction": fraud_status_hcpcs,
            "predicted_probability": round(fraud_ratio, 2)
        }
    }

    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True)