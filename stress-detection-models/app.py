import warnings
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# Load all the required models and preprocessing objects
try:
    stacking_clf = joblib.load("stacking_classifier_model.pkl")
    scaler = joblib.load("scaler.pkl")
    pca = joblib.load("pca.pkl")
    label_encoders = joblib.load("label_encoders.pkl")
    le_target = joblib.load("le_target.pkl")
    df = pd.read_csv("final_synthetic_stress_dataset.csv")
    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    print("Loaded all required models and data.")
except FileNotFoundError as e:
    print(f"Error loading files: {e}")
    raise

# Define features and columns
features = [
    "HR",
    "HRV",
    "SpO2",
    "Steps",
    "Distance",
    "Calories",
    "ActiveTime",
    "SleepDuration",
    "SleepEfficiency",
    "Age",
    "Sex",
    "DrinkingHabits",
    "SmokingHabits",
    "PastMedicalHistory",
    "Depression",
    "Context",
    "Hour",
    "DayOfWeek",
    "IsWeekend",
    "TimeOfDay",
    "HR_RollingMean",
    "HR_RollingStd",
    "HRV_RollingMean",
    "HRV_RollingStd",
    "SpO2_RollingMean",
    "SpO2_RollingStd",
    "HR_Steps_Interaction",
    "HRV_SleepDuration_Interaction",
    "ActivityIntensity",
]

categorical_cols = [
    "Sex",
    "DrinkingHabits",
    "SmokingHabits",
    "PastMedicalHistory",
    "Depression",
    "Context",
    "TimeOfDay",
    "ActivityIntensity",
]
numerical_cols = [col for col in features if col not in categorical_cols]


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get data from request
        data = request.json

        # Create DataFrame with the input data
        new_data = {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "UserID": data.get("UserID", "U999"),  # Default UserID if not provided
            "HR": float(data["HR"]),
            "HRV": float(data["HRV"]),
            "SpO2": float(data["SpO2"]),
            "Steps": int(data["Steps"]),
            "Distance": float(data["Distance"]),
            "Calories": float(data["Calories"]),
            "ActiveTime": float(data["ActiveTime"]),
            "SleepDuration": float(data["SleepDuration"]),
            "SleepEfficiency": float(data["SleepEfficiency"]),
            "Height": float(data["Height"]),
            "Weight": float(data["Weight"]),
            "Age": int(data["Age"]),
            "Sex": data["Sex"],
            "DrinkingHabits": data.get("DrinkingHabits", "Occasional"),
            "SmokingHabits": data.get("SmokingHabits", "Non-smoker"),
            "PastMedicalHistory": data.get("PastMedicalHistory", "None"),
            "Depression": data.get("Depression", "No"),
            "Context": data.get("Context", "Work"),
        }

        new_df = pd.DataFrame([new_data])

        # Feature Engineering
        new_df["Timestamp"] = pd.to_datetime(new_df["Timestamp"])
        new_df["Hour"] = new_df["Timestamp"].dt.hour
        new_df["DayOfWeek"] = new_df["Timestamp"].dt.dayofweek
        new_df["IsWeekend"] = new_df["DayOfWeek"].isin([5, 6]).astype(int)
        new_df["TimeOfDay"] = pd.cut(
            new_df["Hour"],
            bins=[0, 6, 12, 18, 24],
            labels=["Night", "Morning", "Afternoon", "Evening"],
            include_lowest=True,
        )

        # Rolling Statistics
        window = 6
        user_id = new_df["UserID"].iloc[0]
        if user_id in df["UserID"].values:
            user_history = df[df["UserID"] == user_id][
                ["Timestamp", "HR", "HRV", "SpO2"]
            ].copy()
            user_history = pd.concat(
                [user_history, new_df[["Timestamp", "HR", "HRV", "SpO2"]]],
                ignore_index=True,
            )
            for col in ["HR", "HRV", "SpO2"]:
                new_df[f"{col}_RollingMean"] = (
                    user_history[col]
                    .rolling(window=window, min_periods=1)
                    .mean()
                    .iloc[-1]
                )
                new_df[f"{col}_RollingStd"] = (
                    user_history[col]
                    .rolling(window=window, min_periods=1)
                    .std()
                    .iloc[-1]
                )
        else:
            # Use dataset averages for new users
            for col in ["HR", "HRV", "SpO2"]:
                new_df[f"{col}_RollingMean"] = df[col].mean()
                new_df[f"{col}_RollingStd"] = df[col].std()

        # Interaction Features
        new_df["HR_Steps_Interaction"] = new_df["HR"] * new_df["Steps"]
        new_df["HRV_SleepDuration_Interaction"] = (
            new_df["HRV"] * new_df["SleepDuration"]
        )
        new_df["ActivityIntensity"] = pd.cut(
            new_df["Steps"],
            bins=[-1, 100, 400, 600],
            labels=["Low", "Moderate", "High"],
            include_lowest=True,
        )

        # Prepare features
        X_new = new_df[features]

        # Encode categorical variables
        for col in categorical_cols:
            try:
                X_new[col] = label_encoders[col].transform(X_new[col])
            except ValueError:
                valid_values = label_encoders[col].classes_.tolist()
                return (
                    jsonify(
                        {
                            "error": f"Invalid value for {col}. Must be one of {valid_values}"
                        }
                    ),
                    400,
                )

        # Scale numerical features
        X_new[numerical_cols] = scaler.transform(X_new[numerical_cols])

        # Apply PCA
        X_new_pca = pca.transform(X_new[numerical_cols])
        X_new_pca_df = pd.DataFrame(
            X_new_pca, columns=[f"PC{i+1}" for i in range(X_new_pca.shape[1])]
        )

        # Combine PCA components with categorical features
        X_new_final = pd.concat(
            [X_new_pca_df, X_new[categorical_cols].reset_index(drop=True)], axis=1
        )

        # Predict
        y_pred = stacking_clf.predict(X_new_final)
        y_proba = stacking_clf.predict_proba(X_new_final)

        # Get prediction results
        predicted_class = le_target.inverse_transform(y_pred)[0]
        probabilities = {
            le_target.inverse_transform([i])[0]: float(prob)
            for i, prob in enumerate(y_proba[0])
        }

        # Prepare response - ensure all values are JSON serializable
        response = {
            "stressLevel": int(
                y_pred[0] + 1
            ),  # Convert to 1-3 scale and ensure it's a Python int
            "stressCategory": str(predicted_class),  # Ensure it's a Python string
            "probabilities": {
                str(k): float(v) for k, v in probabilities.items()
            },  # Convert all numeric values to float
            "timestamp": str(new_data["Timestamp"]),  # Ensure timestamp is a string
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Only enable debug mode in development environments
    is_development = False  # Set this based on your environment
    app.run(debug=is_development, port=8000)
