# Script para entrenar el modelo (basado en tu código original)
import joblib
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import os

print("="*60)
print("ENTRENANDO Y GUARDANDO MODELO DE DIAGNOSTICO")
print("="*60)

# Crear directorios si no existen
os.makedirs('models', exist_ok=True)
os.makedirs('data', exist_ok=True)

# Cargar el dataset
df = pd.read_csv('data/Disease_symptom_and_patient_profile_dataset.csv')

print(f"\nDataset cargado: {df.shape[0]} registros, {df['Disease'].nunique()} enfermedades")

# Preprocesamiento de datos
df_processed = df.copy()

# Codificar variables categoricas binarias (Yes/No)
binary_columns = ['Fever', 'Cough', 'Fatigue', 'Difficulty Breathing']
for col in binary_columns:
    df_processed[col] = df_processed[col].map({'Yes': 1, 'No': 0})

# Codificar Gender
df_processed['Gender'] = df_processed['Gender'].map({'Male': 1, 'Female': 0})

# Codificar Blood Pressure
bp_mapping = {'Low': 0, 'Normal': 1, 'High': 2}
df_processed['Blood Pressure'] = df_processed['Blood Pressure'].map(bp_mapping)

# Codificar Cholesterol Level
chol_mapping = {'Low': 0, 'Normal': 1, 'High': 2}
df_processed['Cholesterol Level'] = df_processed['Cholesterol Level'].map(chol_mapping)

# Codificar Disease (variable objetivo)
le_disease = LabelEncoder()
df_processed['Disease_Encoded'] = le_disease.fit_transform(df_processed['Disease'])

print(f"Variables codificadas correctamente")
print(f"Total de enfermedades: {len(le_disease.classes_)}")

# Preparar datos
X = df_processed[['Fever', 'Cough', 'Fatigue', 'Difficulty Breathing', 
                  'Age', 'Gender', 'Blood Pressure', 'Cholesterol Level']]
y = df_processed['Disease_Encoded']

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\nConjunto de entrenamiento: {X_train.shape[0]} muestras")
print(f"Conjunto de prueba: {X_test.shape[0]} muestras")

# Entrenar modelo optimizado
print("\nEntrenando modelo Random Forest optimizado...")
rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=20,
    min_samples_split=3,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    class_weight='balanced',
    n_jobs=-1
)

rf_model.fit(X_train, y_train)
print("Modelo entrenado exitosamente")

# Evaluar modelo
y_pred = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nPrecision del modelo: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Importancia de caracteristicas
feature_importance = {
    feature: float(importance) 
    for feature, importance in zip(X.columns, rf_model.feature_importances_)
}

print("\nImportancia de caracteristicas:")
for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
    print(f"  {feature}: {importance:.4f}")

# Guardar modelo y componentes
print("\n" + "="*60)
print("GUARDANDO ARCHIVOS PARA DEPLOYMENT")
print("="*60)

joblib.dump(rf_model, 'models/modelo_rf_disease.pkl')
print("✅ Modelo guardado: models/modelo_rf_disease.pkl")

joblib.dump(le_disease, 'models/label_encoder.pkl')
print("✅ LabelEncoder guardado: models/label_encoder.pkl")

metadata = {
    'model_type': 'RandomForestClassifier',
    'features': X.columns.tolist(),
    'n_features': len(X.columns),
    'classes': le_disease.classes_.tolist(),
    'n_classes': len(le_disease.classes_),
    'accuracy': float(accuracy),
    'n_estimators': 300,
    'max_depth': 20,
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'feature_importance': feature_importance,
    'encodings': {
        'fever': {'Yes': 1, 'No': 0},
        'cough': {'Yes': 1, 'No': 0},
        'fatigue': {'Yes': 1, 'No': 0},
        'difficulty_breathing': {'Yes': 1, 'No': 0},
        'gender': {'Male': 1, 'Female': 0},
        'blood_pressure': {'Low': 0, 'Normal': 1, 'High': 2},
        'cholesterol_level': {'Low': 0, 'Normal': 1, 'High': 2}
    }
}

with open('models/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print("✅ Metadata guardada: models/model_metadata.json")

mappings = {
    'bp_mapping': bp_mapping,
    'chol_mapping': chol_mapping,
    'feature_names': X.columns.tolist()
}

with open('models/model_mappings.json', 'w') as f:
    json.dump(mappings, f, indent=2)
print("✅ Mapeos guardados: models/model_mappings.json")

print("\n" + "="*60)
print(f"✅ ENTRENAMIENTO COMPLETADO")
print(f"   Precisión: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"   Enfermedades: {len(le_disease.classes_)}")
print("="*60)
