# Sistema de Diagnóstico Médico con IA

Aplicación web completa para diagnóstico médico asistido por inteligencia artificial, integrada con una API local de machine learning.

## 🏥 Características

- **Autenticación de Médicos**: Sistema de login seguro para profesionales de la salud
- **Dashboard Interactivo**: Visualización de estadísticas y consultas recientes
- **Formulario Multi-Paso**: Captura estructurada de información del paciente
- **Diagnóstico en Tiempo Real**: Integración con API de ML para predicción de enfermedades
- **Resultados Detallados**: Visualización de diagnósticos con niveles de confianza
- **Historial de Consultas**: Búsqueda y filtrado de consultas anteriores
- **Exportación de Informes**: Descarga de reportes en formato texto

## 🚀 Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Gráficos**: Recharts
- **API**: Integración con FastAPI (Python)

## 📋 Requisitos Previos

1. **Node.js** 18+ instalado
2. **API de Diagnóstico** ejecutándose en `http://localhost:8000`
3. Navegador web moderno

## 🔧 Instalación

### 1. Clonar o Descargar el Proyecto

\`\`\`bash
# Si usas Git
git clone <repository-url>
cd medical-diagnosis-app

# O descarga el ZIP y extrae los archivos
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
# o
yarn install
# o
pnpm install
\`\`\`

### 3. Configurar la API

Asegúrate de que tu API de diagnóstico esté ejecutándose en `http://localhost:8000`. La aplicación espera el siguiente endpoint:

**POST** `http://localhost:8000/api/predict`

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

**Response:**
\`\`\`json
{
  "disease": "Influenza",
  "probability": 87.34,
  "confidence_level": "high",
  "all_probabilities": {
    "Influenza": 87.34,
    "Common Cold": 8.21,
    "Pneumonia": 2.45
  },
  "timestamp": "2025-01-15T10:30:00"
}
\`\`\`

### 4. Ejecutar la Aplicación

\`\`\`bash
npm run dev
# o
yarn dev
# o
pnpm dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## 👨‍⚕️ Uso de la Aplicación

### 1. Iniciar Sesión

Credenciales de prueba:
- **Email**: `doctor@hospital.com`
- **Contraseña**: `demo123`

### 2. Dashboard

Después de iniciar sesión, verás:
- Estadísticas de consultas totales, pendientes y completadas
- Gráfico de actividad semanal
- Lista de consultas recientes

### 3. Nueva Consulta

Haz clic en "Nueva Consulta" y completa los 3 pasos:

**Paso 1: Datos Generales del Paciente**
- Nombre completo
- Edad (número)
- Teléfono de contacto
- Género (Male/Female)

**Paso 2: Presión Arterial y Colesterol**
- **Presión Arterial**: Ingresa valores sistólica/diastólica en mmHg
  - **High**: Sistólica ≥140 o Diastólica ≥90
  - **Normal**: Sistólica 90-139 y Diastólica 60-89
  - **Low**: Sistólica <90 o Diastólica <60
- **Colesterol**: Ingresa valor en mg/dL
  - **High**: ≥240 mg/dL
  - **Normal**: <240 mg/dL

**Paso 3: Síntomas y Notas**
- Selecciona los síntomas presentes:
  - Fiebre
  - Tos
  - Fatiga
  - Dificultad para respirar
- Agrega notas adicionales (opcional):
  - Observaciones clínicas
  - Historial médico relevante
  - Medicamentos actuales
  - Cualquier información adicional

### 4. Diagnóstico

El sistema:
1. Se conecta a la API local en `http://localhost:8000`
2. Envía los datos del paciente al endpoint `/api/predict`
3. Recibe la predicción de enfermedad con probabilidades
4. Muestra el progreso en tiempo real con 4 fases:
   - Conectando con API
   - Analizando síntomas
   - Generando predicción
   - Finalizando diagnóstico

### 5. Resultados

Visualiza:
- **Diagnóstico principal** con nivel de confianza y porcentaje exacto
- **Diagnósticos alternativos** con probabilidades
- **Recomendaciones de tratamiento** personalizadas
- **Información completa del paciente**: nombre, edad, género, teléfono
- **Síntomas reportados** con indicadores visuales
- **Signos vitales** con valores numéricos y categorías
- **Notas adicionales** del médico
- **Opción para descargar informe** completo en formato texto

### 6. Historial

Accede a todas las consultas anteriores con:
- Búsqueda por ID de paciente o diagnóstico
- Filtros por fecha
- Ordenamiento por fecha o confianza

## 🔍 Estructura del Proyecto

\`\`\`
medical-diagnosis-app/
├── app/
│   ├── consultation/       # Formulario de consulta (3 pasos)
│   ├── dashboard/          # Panel principal
│   ├── diagnosis/          # Proceso de diagnóstico con API
│   ├── history/            # Historial de consultas
│   ├── login/              # Página de login
│   ├── results/[id]/       # Resultados detallados
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de inicio
│   └── globals.css         # Estilos globales
├── components/
│   ├── app-header.tsx      # Header de la aplicación
│   └── ui/                 # Componentes UI de shadcn
├── lib/
│   ├── auth.ts             # Utilidades de autenticación
│   └── utils.ts            # Utilidades generales
└── README.md               # Este archivo
\`\`\`

## 🎨 Categorización de Valores

### Presión Arterial
La aplicación convierte automáticamente los valores numéricos a categorías:

- **High**: Sistólica ≥140 o Diastólica ≥90
- **Normal**: Sistólica 90-139 y Diastólica 60-89
- **Low**: Sistólica <90 o Diastólica <60

**Ejemplos:**
- 150/95 → High
- 120/80 → Normal
- 85/55 → Low

### Colesterol
La aplicación convierte automáticamente los valores numéricos a categorías:

- **High**: ≥240 mg/dL
- **Normal**: <240 mg/dL

**Ejemplos:**
- 250 mg/dL → High
- 180 mg/dL → Normal
- 220 mg/dL → Normal

### Niveles de Confianza (API)
- **high**: ≥80% (Alta confianza)
- **medium**: 60-79% (Confianza media)
- **low**: <60% (Confianza baja)

## 📄 Informe Descargable

El informe incluye toda la información capturada:

\`\`\`
INFORME DE DIAGNÓSTICO MÉDICO
================================

ID de Diagnóstico: DIAG-1234567890
Fecha: 15 de enero de 2025, 10:30

INFORMACIÓN DEL PACIENTE
------------------------
Nombre: Juan Pérez García
Edad: 45 años
Género: Male
Teléfono: +52 123 456 7890

SÍNTOMAS REPORTADOS
-------------------
Fiebre: Yes
Tos: Yes
Fatiga: No
Dificultad para respirar: No

SIGNOS VITALES
--------------
Presión Arterial: 150/95 mmHg (High)
Nivel de Colesterol: 220 mg/dL (Normal)

NOTAS ADICIONALES
-----------------
Paciente reporta síntomas desde hace 3 días.
Historial de hipertensión controlada.

DIAGNÓSTICO PRINCIPAL
---------------------
Influenza
Nivel de Confianza: 87.34% (high)

DIAGNÓSTICOS ALTERNATIVOS
-------------------------
- Common Cold (8.21%)
- Pneumonia (2.45%)

RECOMENDACIONES
---------------
1. Iniciar tratamiento específico según protocolo médico
2. Realizar seguimiento de síntomas durante 48-72 horas
3. Mantener hidratación adecuada

URGENCIA: Prioridad Moderada
\`\`\`

## 🔐 Seguridad

- La autenticación actual usa localStorage (solo para demostración)
- En producción, implementa autenticación real con JWT o sesiones
- Asegura la API con autenticación y HTTPS
- Valida todos los datos del lado del servidor

## 🐛 Solución de Problemas

### Error: "Error de Conexión"

**Causa**: La API no está ejecutándose o no es accesible

**Solución**:
1. Verifica que la API esté corriendo: `http://localhost:8000`
2. Comprueba que el endpoint `/api/predict` esté disponible
3. Revisa la consola del navegador para más detalles
4. Asegúrate de que la API acepte los campos correctos

### Error: CORS

**Causa**: La API no permite peticiones desde el origen del frontend

**Solución**: Configura CORS en tu API FastAPI:
\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

### Los datos no se guardan

**Causa**: localStorage puede estar deshabilitado

**Solución**:
1. Verifica que las cookies/localStorage estén habilitados
2. Prueba en modo incógnito
3. Revisa la consola del navegador

### Error: "API Error: 422"

**Causa**: Los datos enviados no coinciden con el formato esperado por la API

**Solución**:
1. Verifica que la API espere los campos: `fever`, `cough`, `fatigue`, `difficulty_breathing`, `age`, `gender`, `blood_pressure`, `cholesterol_level`
2. Asegúrate de que los síntomas sean "Yes" o "No"
3. Verifica que age sea un número
4. Confirma que gender sea "Male" o "Female"
5. Verifica que blood_pressure y cholesterol_level sean "High", "Normal" o "Low"

## 📊 Formato de Datos

### Datos Enviados a la API

\`\`\`json
{
  "fever": "Yes",
  "cough": "Yes",
  "fatigue": "No",
  "difficulty_breathing": "No",
  "age": 45,
  "gender": "Male",
  "blood_pressure": "High",
  "cholesterol_level": "Normal"
}
\`\`\`

### Datos Almacenados Localmente

**Consulta Completa (incluye datos adicionales no enviados a la API):**
\`\`\`json
{
  "name": "Juan Pérez García",
  "age": "45",
  "gender": "Male",
  "phone": "+52 123 456 7890",
  "fever": "Yes",
  "cough": "Yes",
  "fatigue": "No",
  "difficulty_breathing": "No",
  "blood_pressure": "High",
  "blood_pressure_raw": "150/95",
  "cholesterol_level": "Normal",
  "cholesterol_raw": "220",
  "notes": "Paciente reporta síntomas desde hace 3 días..."
}
\`\`\`

**Resultado de Diagnóstico:**
\`\`\`json
{
  "id": "DIAG-1234567890",
  "consultation": { /* datos completos de consulta */ },
  "timestamp": "2025-01-15T10:30:00",
  "diagnosis": {
    "primary": "Influenza",
    "confidence": 87.34,
    "confidenceLevel": "high",
    "alternatives": [
      { "condition": "Common Cold", "confidence": 8.21 }
    ],
    "recommendations": [
      "Iniciar tratamiento específico según protocolo médico",
      "Realizar seguimiento de síntomas durante 48-72 horas"
    ],
    "urgency": "moderate"
  }
}
\`\`\`

## 🚀 Despliegue

### Desarrollo Local
\`\`\`bash
npm run dev
\`\`\`

### Producción
\`\`\`bash
npm run build
npm start
\`\`\`

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno si es necesario
3. Despliega automáticamente

**Nota**: Para producción, necesitarás configurar la URL de la API como variable de entorno y actualizar el código para usar `process.env.NEXT_PUBLIC_API_URL` en lugar de `http://localhost:8000`.

## 🔄 Próximas Mejoras

- [ ] Autenticación real con JWT
- [ ] Base de datos para persistencia
- [ ] Exportación de informes en PDF
- [ ] Gráficos de tendencias de pacientes
- [ ] Notificaciones en tiempo real
- [ ] Modo offline con sincronización
- [ ] Soporte multi-idioma
- [ ] Temas claro/oscuro
- [ ] Historial médico completo del paciente
- [ ] Integración con sistemas hospitalarios

## 📝 Notas Importantes

1. **Solo para Demostración**: Este sistema es una demostración y no debe usarse para diagnósticos médicos reales sin validación profesional.

2. **API Local**: La aplicación requiere que la API esté ejecutándose localmente en `http://localhost:8000`. Para producción, configura una URL de API remota.

3. **Datos de Prueba**: Los datos se almacenan en localStorage y se perderán al limpiar el navegador.

4. **Validación Médica**: Todos los diagnósticos generados por IA deben ser revisados por profesionales médicos calificados.

5. **Datos del Paciente**: El nombre, teléfono y notas se almacenan localmente pero NO se envían a la API de predicción. Solo se usan para el informe descargable.

6. **Categorización Automática**: Los valores numéricos de presión arterial y colesterol se convierten automáticamente a categorías (High/Normal/Low) antes de enviarlos a la API.

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la sección de Solución de Problemas
2. Verifica la consola del navegador para errores
3. Asegúrate de que la API esté funcionando correctamente
4. Comprueba que los formatos de datos coincidan con lo esperado

## 📄 Licencia

Este proyecto es solo para fines educativos y de demostración.

---

**Desarrollado con ❤️ para mejorar el diagnóstico médico asistido por IA**
