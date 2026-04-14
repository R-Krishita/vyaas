import joblib

encoders = joblib.load(r'C:\Projects\vyaas\dataset\label_encoders.pkl')
print("Keys in label_encoders.pkl:", list(encoders.keys()))

for key, enc in encoders.items():
    print(f"\n{key}: {list(enc.classes_[:5])}... ({len(enc.classes_)} total)")
