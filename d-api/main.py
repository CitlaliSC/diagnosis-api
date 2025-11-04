from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import joblib
import numpy as np
import json
import os
from datetime import datetime

app = FastAPI(
    title="Disease Prediction API",
    description="API para predecir enfermedades basándose en síntomas y perfil del paciente",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo y componentes al iniciar
MODEL_PATH = "models/modelo_rf_disease.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
METADATA_PATH = "models/model_metadata.json"
MAPPINGS_PATH = "models/model_mappings.json"

modelo = None
label_encoder = None
metadata = None
mappings = None

@app.on_event("startup")
async def load_model():
    """Cargar modelo y componentes al iniciar la API"""
    global modelo, label_encoder, metadata, mappings
    
    try:
        if os.path.exists(MODEL_PATH):
            modelo = joblib.load(MODEL_PATH)
            label_encoder = joblib.load(ENCODER_PATH)
            
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
            
            with open(MAPPINGS_PATH, 'r') as f:
                mappings = json.load(f)
            
            print("✅ Modelo cargado exitosamente")
            print(f"   Precisión: {metadata['accuracy']:.4f}")
            print(f"   Enfermedades: {metadata['n_classes']}")
        else:
            print("⚠️  Modelo no encontrado. Ejecuta train.py primero.")
    except Exception as e:
        print(f"❌ Error cargando modelo: {e}")

# Modelos Pydantic para validación
class PatientInput(BaseModel):
    fever: str = Field(..., description="'Yes' o 'No'")
    cough: str = Field(..., description="'Yes' o 'No'")
    fatigue: str = Field(..., description="'Yes' o 'No'")
    difficulty_breathing: str = Field(..., description="'Yes' o 'No'")
    age: int = Field(..., ge=0, le=120, description="Edad del paciente")
    gender: str = Field(..., description="'Male' o 'Female'")
    blood_pressure: str = Field(..., description="'Low', 'Normal' o 'High'")
    cholesterol_level: str = Field(..., description="'Low', 'Normal' o 'High'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "fever": "Yes",
                "cough": "Yes",
                "fatigue": "Yes",
                "difficulty_breathing": "No",
                "age": 45,
                "gender": "Male",
                "blood_pressure": "High",
                "cholesterol_level": "Normal"
            }
        }

class PredictionResponse(BaseModel):
    disease: str
    probability: float
    confidence_level: str
    all_probabilities: Dict[str, float]
    timestamp: str

class ModelInfo(BaseModel):
    model_type: str
    accuracy: float
    n_classes: int
    n_features: int
    classes: List[str]
    feature_importance: Dict[str, float]

# Endpoints
@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "message": "Disease Prediction API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": modelo is not None,
        "endpoints": {
            "predict": "/api/predict",
            "model_info": "/api/model/info",
            "health": "/api/health",
            "diseases": "/api/diseases"
        }
    }

@app.get("/api/health")
async def health_check():
    """Verificar el estado de la API y el modelo"""
    return {
        "status": "healthy" if modelo is not None else "model_not_loaded",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": modelo is not None
    }

@app.get("/api/diseases", response_model=List[str])
async def get_diseases():
    """Obtener lista de todas las enfermedades que el modelo puede predecir"""
    if modelo is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    return metadata['classes']

@app.get("/api/model/info", response_model=ModelInfo)
async def get_model_info():
    """Obtener información detallada del modelo"""
    if modelo is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    return ModelInfo(
        model_type=metadata['model_type'],
        accuracy=metadata['accuracy'],
        n_classes=metadata['n_classes'],
        n_features=metadata['n_features'],
        classes=metadata['classes'],
        feature_importance=metadata['feature_importance']
    )

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_disease(patient: PatientInput):
    """
    Predecir enfermedad basándose en síntomas y perfil del paciente
    
    Retorna la enfermedad más probable con su probabilidad
    """
    if modelo is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
    
    try:
        # Validar y codificar entrada
        fever_enc = 1 if patient.fever.lower() == 'yes' else 0
        cough_enc = 1 if patient.cough.lower() == 'yes' else 0
        fatigue_enc = 1 if patient.fatigue.lower() == 'yes' else 0
        breathing_enc = 1 if patient.difficulty_breathing.lower() == 'yes' else 0
        gender_enc = 1 if patient.gender.lower() == 'male' else 0
        
        # Validar blood_pressure y cholesterol_level
        if patient.blood_pressure not in mappings['bp_mapping']:
            raise HTTPException(
                status_code=400, 
                detail=f"blood_pressure debe ser: {list(mappings['bp_mapping'].keys())}"
            )
        
        if patient.cholesterol_level not in mappings['chol_mapping']:
            raise HTTPException(
                status_code=400,
                detail=f"cholesterol_level debe ser: {list(mappings['chol_mapping'].keys())}"
            )
        
        bp_enc = mappings['bp_mapping'][patient.blood_pressure]
        chol_enc = mappings['chol_mapping'][patient.cholesterol_level]
        
        # Crear array de características
        features = np.array([[
            fever_enc, cough_enc, fatigue_enc, breathing_enc,
            patient.age, gender_enc, bp_enc, chol_enc
        ]])
        
        # Hacer predicción
        prediction = modelo.predict(features)[0]
        probabilities = modelo.predict_proba(features)[0]
        
        # Obtener nombre de la enfermedad
        disease = label_encoder.inverse_transform([prediction])[0]
        probability = float(probabilities[prediction] * 100)
        
        # Obtener todas las probabilidades
        all_probs = {
            label_encoder.inverse_transform([i])[0]: float(prob * 100)
            for i, prob in enumerate(probabilities)
        }
        
        # Ordenar por probabilidad
        all_probs = dict(sorted(all_probs.items(), key=lambda x: x[1], reverse=True))
        
        # Determinar nivel de confianza
        if probability >= 80:
            confidence = "high"
        elif probability >= 60:
            confidence = "medium"
        else:
            confidence = "low"
        
        return PredictionResponse(
            disease=disease,
            probability=round(probability, 2),
            confidence_level=confidence,
            all_probabilities=all_probs,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")

@app.get("/api/symptoms")
async def get_symptoms_info():
    """Obtener información sobre los síntomas y valores válidos"""
    return {
        "symptoms": {
            "fever": ["Yes", "No"],
            "cough": ["Yes", "No"],
            "fatigue": ["Yes", "No"],
            "difficulty_breathing": ["Yes", "No"]
        },
        "patient_profile": {
            "age": "0-120",
            "gender": ["Male", "Female"],
            "blood_pressure": ["Low", "Normal", "High"],
            "cholesterol_level": ["Low", "Normal", "High"]
        }
    }
