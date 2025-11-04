# 🏥 Disease Prediction API

API REST para predecir enfermedades basándose en síntomas y perfil del paciente usando Machine Learning (Random Forest).

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Endpoints de la API](#endpoints-de-la-api)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Integración con Frontend](#integración-con-frontend)

## ✨ Características

- 🤖 Predicción de enfermedades usando Random Forest
- 🐳 Completamente dockerizado
- 🚀 API REST con FastAPI
- 📊 Múltiples endpoints informativos
- 🔒 Validación de datos con Pydantic
- 🌐 CORS habilitado para desarrollo local
- 📈 Información detallada del modelo y probabilidades

## 🔧 Requisitos Previos

- Docker y Docker Compose instalados
- Dataset: `Disease_symptom_and_patient_profile_dataset.csv`

## 🚀 Instalación y Ejecución

### Paso 1: Preparar el Dataset

Coloca tu archivo CSV en la carpeta `data/`:

\`\`\`bash
mkdir -p data
# Copia tu archivo Disease_symptom_and_patient_profile_dataset.csv a data/
\`\`\`

### Paso 2: Entrenar el Modelo

Antes de ejecutar la API, necesitas entrenar el modelo:

\`\`\`bash
# Opción 1: Entrenar localmente (requiere Python 3.11+)
pip install -r requirements.txt
python train.py

# Opción 2: Entrenar con Docker
docker-compose run api python train.py
\`\`\`

Esto generará los archivos del modelo en la carpeta `models/`:
- `modelo_rf_disease.pkl`
- `label_encoder.pkl`
- `model_metadata.json`
- `model_mappings.json`

### Paso 3: Iniciar la API

\`\`\`bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d
\`\`\`

La API estará disponible en: **http://localhost:8000**

### Paso 4: Verificar que Funciona

Abre tu navegador en: http://localhost:8000

Deberías ver la información de la API.

## 📡 Endpoints de la API

### 1. **GET /** - Información General
Retorna información básica de la API y endpoints disponibles.

**Respuesta:**
\`\`\`json
{
  "message": "Disease Prediction API",
  "version": "1.0.0",
  "status": "running",
  "model_loaded": true,
  "endpoints": {
    "predict": "/api/predict",
    "model_info": "/api/model/info",
    "health": "/api/health",
    "diseases": "/api/diseases"
  }
}
\`\`\`

---

### 2. **GET /api/health** - Health Check
Verifica el estado de la API y si el modelo está cargado.

**Respuesta:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00",
  "model_loaded": true
}
\`\`\`

---

### 3. **GET /api/diseases** - Lista de Enfermedades
Obtiene todas las enfermedades que el modelo puede predecir.

**Respuesta:**
\`\`\`json
[
  "Influenza",
  "Common Cold",
  "Pneumonia",
  "COVID-19",
  "Bronchitis",
  ...
]
\`\`\`

---

### 4. **GET /api/model/info** - Información del Modelo
Obtiene información detallada sobre el modelo entrenado.

**Respuesta:**
\`\`\`json
{
  "model_type": "RandomForestClassifier",
  "accuracy": 0.9523,
  "n_classes": 10,
  "n_features": 8,
  "classes": ["Influenza", "Common Cold", ...],
  "feature_importance": {
    "Fever": 0.2341,
    "Age": 0.1876,
    ...
  }
}
\`\`\`

---

### 5. **GET /api/symptoms** - Información de Síntomas
Obtiene los valores válidos para cada campo.

**Respuesta:**
\`\`\`json
{
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
\`\`\`

---

### 6. **POST /api/predict** - Predecir Enfermedad ⭐
**Endpoint principal** para predecir enfermedades.

**Request Body:**
\`\`\`json
{
  "fever": "Yes",
  "cough": "Yes",
  "fatigue": "Yes",
  "difficulty_breathing": "No",
  "age": 45,
  "gender": "Male",
  "blood_pressure": "High",
  "cholesterol_level": "Normal"
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "disease": "Influenza",
  "probability": 87.34,
  "confidence_level": "high",
  "all_probabilities": {
    "Influenza": 87.34,
    "Common Cold": 8.21,
    "Pneumonia": 2.45,
    ...
  },
  "timestamp": "2025-01-15T10:30:00"
}
\`\`\`

**Niveles de Confianza:**
- `high`: ≥ 80%
- `medium`: 60-79%
- `low`: < 60%

---

## 💻 Ejemplos de Uso

### Con cURL

\`\`\`bash
# Predecir enfermedad
curl -X POST "http://localhost:8000/api/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fever": "Yes",
    "cough": "Yes",
    "fatigue": "Yes",
    "difficulty_breathing": "No",
    "age": 45,
    "gender": "Male",
    "blood_pressure": "High",
    "cholesterol_level": "Normal"
  }'

# Obtener lista de enfermedades
curl "http://localhost:8000/api/diseases"

# Health check
curl "http://localhost:8000/api/health"
\`\`\`

### Con JavaScript (Fetch API)

\`\`\`javascript
// Predecir enfermedad
async function predictDisease(patientData) {
  const response = await fetch('http://localhost:8000/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData)
  });
  
  const result = await response.json();
  console.log('Enfermedad predicha:', result.disease);
  console.log('Probabilidad:', result.probability + '%');
  console.log('Confianza:', result.confidence_level);
  return result;
}

// Ejemplo de uso
const patient = {
  fever: "Yes",
  cough: "Yes",
  fatigue: "Yes",
  difficulty_breathing: "No",
  age: 45,
  gender: "Male",
  blood_pressure: "High",
  cholesterol_level: "Normal"
};

predictDisease(patient);
\`\`\`

### Con Python (requests)

\`\`\`python
import requests

# Predecir enfermedad
url = "http://localhost:8000/api/predict"
patient_data = {
    "fever": "Yes",
    "cough": "Yes",
    "fatigue": "Yes",
    "difficulty_breathing": "No",
    "age": 45,
    "gender": "Male",
    "blood_pressure": "High",
    "cholesterol_level": "Normal"
}

response = requests.post(url, json=patient_data)
result = response.json()

print(f"Enfermedad: {result['disease']}")
print(f"Probabilidad: {result['probability']}%")
print(f"Confianza: {result['confidence_level']}")
\`\`\`

### Con Axios (React/Vue/Angular)

\`\`\`javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Predecir enfermedad
export const predictDisease = async (patientData) => {
  try {
    const response = await axios.post(\`\${API_URL}/api/predict\`, patientData);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener lista de enfermedades
export const getDiseases = async () => {
  const response = await axios.get(\`\${API_URL}/api/diseases\`);
  return response.data;
};

// Uso en componente React
function App() {
  const handlePredict = async () => {
    const patient = {
      fever: "Yes",
      cough: "Yes",
      fatigue: "Yes",
      difficulty_breathing: "No",
      age: 45,
      gender: "Male",
      blood_pressure: "High",
      cholesterol_level: "Normal"
    };
    
    const result = await predictDisease(patient);
    console.log(result);
  };
  
  return <button onClick={handlePredict}>Predecir</button>;
}
\`\`\`

---

## 📁 Estructura del Proyecto

\`\`\`
disease-prediction-api/
├── data/
│   └── Disease_symptom_and_patient_profile_dataset.csv
├── models/
│   ├── modelo_rf_disease.pkl
│   ├── label_encoder.pkl
│   ├── model_metadata.json
│   └── model_mappings.json
├── main.py                 # API FastAPI
├── train.py               # Script de entrenamiento
├── requirements.txt       # Dependencias Python
├── Dockerfile            # Configuración Docker
├── docker-compose.yml    # Orquestación Docker
├── .gitignore
└── README.md
\`\`\`

---

## 🌐 Integración con Frontend

### Ejemplo Completo con React

\`\`\`jsx
import React, { useState } from 'react';
import axios from 'axios';

function DiseasePredictionForm() {
  const [formData, setFormData] = useState({
    fever: 'No',
    cough: 'No',
    fatigue: 'No',
    difficulty_breathing: 'No',
    age: 30,
    gender: 'Male',
    blood_pressure: 'Normal',
    cholesterol_level: 'Normal'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/predict',
        formData
      );
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al predecir enfermedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select 
          value={formData.fever}
          onChange={(e) => setFormData({...formData, fever: e.target.value})}
        >
          <option value="Yes">Sí</option>
          <option value="No">No</option>
        </select>
        
        {/* Más campos... */}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Prediciendo...' : 'Predecir'}
        </button>
      </form>
      
      {result && (
        <div>
          <h3>Resultado:</h3>
          <p>Enfermedad: {result.disease}</p>
          <p>Probabilidad: {result.probability}%</p>
          <p>Confianza: {result.confidence_level}</p>
        </div>
      )}
    </div>
  );
}

export default DiseasePredictionForm;
\`\`\`

---

## 🛠️ Comandos Útiles

\`\`\`bash
# Ver logs de la API
docker-compose logs -f

# Detener la API
docker-compose down

# Reconstruir la imagen
docker-compose up --build

# Entrenar modelo nuevamente
docker-compose run api python train.py

# Acceder al contenedor
docker-compose exec api bash

# Ver documentación interactiva (Swagger)
# Abre: http://localhost:8000/docs
\`\`\`

---

## 📊 Documentación Interactiva

FastAPI genera automáticamente documentación interactiva:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Desde ahí puedes probar todos los endpoints directamente desde el navegador.

---

## 🐛 Troubleshooting

### Error: "Modelo no cargado"
- Asegúrate de haber ejecutado `train.py` primero
- Verifica que existan los archivos en `models/`

### Error: CORS
- La API ya tiene CORS habilitado para desarrollo
- En producción, modifica `allow_origins` en `main.py`

### Puerto 8000 ocupado
- Cambia el puerto en `docker-compose.yml`: `"8001:8000"`

---

## 📝 Notas

- El modelo debe ser entrenado antes de usar la API
- Los datos de entrada deben seguir el formato exacto especificado
- La API valida automáticamente todos los inputs
- Las probabilidades suman 100% entre todas las enfermedades

---

## 🚀 Próximos Pasos

1. Entrenar el modelo con tu dataset
2. Iniciar la API con Docker
3. Probar los endpoints con la documentación interactiva
4. Integrar con tu frontend

¡Listo para usar! 🎉
