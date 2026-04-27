import pandas as pd
import json
import glob
import os

# Configuration
input_folder = "data/"  # Change this to your folder path
output_folder = "cleaned_data/"
os.makedirs(output_folder, exist_ok=True)

# Data containers
events_data = []
ratings_data = []
demographics_data = []
id_key_data = []

# Get all matching CSV files
files = glob.glob(os.path.join(input_folder, "*_data.csv"))

for file_path in files:
    # Extract subject_id from filename
    file_name = os.path.basename(file_path)
    subject_id = file_name.replace("_data.csv", "")
    
    df = pd.read_csv(file_path)
    
    current_video = None
    
    for _, row in df.iterrows():
        trial_name = row["trial_name"]

        # Clean the response string (handle NaN and empty)
        resp_str = str(row["response"]).strip()
        if not resp_str or resp_str == "nan":
            continue
            
        # Try to decode JSON
        try:
            resp_json = json.loads(resp_str)
        except json.JSONDecodeError:
            print("ERROR: Can't decode JSON!")
            continue

        # events.csv
        if trial_name == "video":
            for entry in resp_json:
                events_data.append({
                    "subject_id": subject_id,
                    "event": entry.get("event"),
                    "video_timestamp": entry.get("video_timestamp"),
                    "audio_timestamp": entry.get("audio_timestamp"),
                    "video": entry.get("video"),
                    "video_id": entry.get("video_id"),
                    "condition": entry.get("condition")
                })
                # Update current video (so ratings.csv knows the corresponding video)
                current_video = entry.get("video")

        # ratings.csv
        elif trial_name == "ratings":
            for trait in resp_json:
                if trait != "instructions":
                    ratings_data.append({
                        "subject_id": subject_id,
                        "trait": trait,
                        "value": resp_json[trait],
                        "video": current_video,
                        "rt": row["rt"]
                    })
        
        # demographics.csv
        elif trial_name == "demographics":
            demographics_data.append({
                "subject_id": subject_id,
                "age": resp_json.get("age"),
                "gender": ",".join(resp_json.get("gender", [])) if isinstance(resp_json.get("gender"), list) else resp_json.get("gender"),
                "race": ",".join(resp_json.get("race", [])) if isinstance(resp_json.get("race"), list) else resp_json.get("race"),
                "education": resp_json.get("education"),
                "feedback": resp_json.get("feedback")
            })

        # id_key.csv
        elif trial_name == "info":
            id_key_data.append({
                "subject_id": subject_id,
                "prolific_id": row["prolific_id"],
                "start_time": row["start_time"],
                "end_time": row["end_time"]
            })

# Convert to DataFrames and save
pd.DataFrame(events_data).to_csv(f"{output_folder}events.csv", index=False)
pd.DataFrame(ratings_data).to_csv(f"{output_folder}ratings.csv", index=False)
pd.DataFrame(demographics_data).to_csv(f"{output_folder}demographics.csv", index=False)
pd.DataFrame(id_key_data).to_csv(f"{output_folder}id_key.csv", index=False)

print(f"Cleaning complete. Files saved to {output_folder}")