"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { isAuthenticated } from "@/lib/auth"
import { Brain, CheckCircle2, Loader2, AlertCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DiagnosisStep {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed"
  progress: number
}

const DIAGNOSIS_STEPS: DiagnosisStep[] = [
  {
    id: "connect",
    title: "Conectando con API",
    description: "Estableciendo conexión con el servidor...",
    status: "pending",
    progress: 0,
  },
  {
    id: "analyze",
    title: "Analizando síntomas",
    description: "Procesando información del paciente...",
    status: "pending",
    progress: 0,
  },
  {
    id: "predict",
    title: "Generando predicción",
    description: "Calculando probabilidades de diagnóstico...",
    status: "pending",
    progress: 0,
  },
  {
    id: "complete",
    title: "Finalizando diagnóstico",
    description: "Preparando resultados...",
    status: "pending",
    progress: 0,
  },
]

export default function DiagnosisPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [steps, setSteps] = useState<DiagnosisStep[]>(DIAGNOSIS_STEPS)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [diagnosisComplete, setDiagnosisComplete] = useState(false)
  const [diagnosisId, setDiagnosisId] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Check if consultation data exists
    const consultationData = localStorage.getItem("currentConsultation")
    if (!consultationData) {
      router.push("/consultation")
      return
    }

    // Generate diagnosis ID
    const id = `DIAG-${Date.now()}`
    setDiagnosisId(id)

    performDiagnosis(JSON.parse(consultationData), id)
  }, [router])

  const performDiagnosis = async (consultationData: any, id: string) => {
    try {
      // Step 1: Connecting
      updateStep(0, "processing")
      await simulateProgress(0, 100)
      updateStep(0, "completed")
      setCurrentStepIndex(1)

      // Step 2: Analyzing
      updateStep(1, "processing")
      await simulateProgress(1, 100)
      updateStep(1, "completed")
      setCurrentStepIndex(2)

      // Step 3: Predicting - Call real API
      updateStep(2, "processing")

      // Prepare API request
      const apiPayload = {
        fever: consultationData.fever,
        cough: consultationData.cough,
        fatigue: consultationData.fatigue,
        difficulty_breathing: consultationData.difficulty_breathing,
        age: Number.parseInt(consultationData.age),
        gender: consultationData.gender,
        blood_pressure: consultationData.blood_pressure,
        cholesterol_level: consultationData.cholesterol_level,
      }

      console.log("[v0] Sending request to API:", apiPayload)

      // Call the local API
      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const apiResult = await response.json()
      console.log("[v0] API Response:", apiResult)

      await simulateProgress(2, 100)
      updateStep(2, "completed")
      setCurrentStepIndex(3)

      // Step 4: Completing
      updateStep(3, "processing")
      await simulateProgress(3, 100)
      updateStep(3, "completed")

      const result = {
        id,
        consultation: consultationData,
        timestamp: apiResult.timestamp || new Date().toISOString(),
        diagnosis: {
          primary: apiResult.disease,
          confidence: apiResult.probability,
          confidenceLevel: apiResult.confidence_level,
          alternatives: Object.entries(apiResult.all_probabilities || {})
            .filter(([disease]) => disease !== apiResult.disease)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([disease, probability]) => ({
              condition: disease,
              confidence: probability,
            })),
          recommendations: generateRecommendations(apiResult.disease, apiResult.confidence_level),
          urgency: getUrgencyLevel(apiResult.confidence_level),
        },
      }

      localStorage.setItem(`diagnosis_${id}`, JSON.stringify(result))

      setDiagnosisComplete(true)
      setOverallProgress(100)

      // Redirect to results
      setTimeout(() => {
        router.push(`/results/${id}`)
      }, 2000)
    } catch (err) {
      console.error("[v0] Diagnosis error:", err)
      setError(
        err instanceof Error
          ? `Error: ${err.message}. Asegúrese de que la API esté ejecutándose en http://localhost:8000`
          : "Error desconocido al conectar con la API",
      )
      updateStep(currentStepIndex, "completed")
    }
  }

  const generateRecommendations = (disease: string, confidenceLevel: string): string[] => {
    const baseRecommendations = [
      "Realizar seguimiento de síntomas durante 48-72 horas",
      "Mantener hidratación adecuada",
      "Descanso apropiado según la condición",
    ]

    if (confidenceLevel === "high") {
      baseRecommendations.unshift("Iniciar tratamiento específico según protocolo médico")
    } else if (confidenceLevel === "medium") {
      baseRecommendations.unshift("Considerar pruebas diagnósticas adicionales")
    } else {
      baseRecommendations.unshift("Evaluación médica adicional recomendada")
    }

    return baseRecommendations
  }

  const getUrgencyLevel = (confidenceLevel: string): "low" | "moderate" | "high" => {
    if (confidenceLevel === "high") return "moderate"
    if (confidenceLevel === "medium") return "moderate"
    return "low"
  }

  const updateStep = (index: number, status: "pending" | "processing" | "completed") => {
    setSteps((prev) => prev.map((step, idx) => (idx === index ? { ...step, status } : step)))
  }

  const simulateProgress = (stepIndex: number, targetProgress: number): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 20
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === stepIndex ? { ...step, progress: Math.min(progress, targetProgress) } : step,
          ),
        )
        setOverallProgress(((stepIndex + progress / 100) / DIAGNOSIS_STEPS.length) * 100)

        if (progress >= targetProgress) {
          clearInterval(interval)
          resolve()
        }
      }, 200)
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Diagnóstico en Proceso</h2>
          <p className="text-muted-foreground mt-2">Conectando con la API de diagnóstico en tiempo real</p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Progreso General</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error de Conexión</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Diagnosis Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={`transition-all ${
                step.status === "processing"
                  ? "border-primary shadow-lg"
                  : step.status === "completed"
                    ? "border-success"
                    : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : step.status === "processing" ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  {step.status === "processing" && (
                    <span className="text-xs font-medium text-primary">{step.progress}%</span>
                  )}
                </div>
              </CardHeader>
              {step.status === "processing" && (
                <CardContent className="pt-0">
                  <Progress value={step.progress} className="h-2" />
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Completion Message */}
        {diagnosisComplete && (
          <Alert className="mt-6 border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              Diagnóstico completado exitosamente. Redirigiendo a los resultados...
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        {!diagnosisComplete && !error && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este proceso utiliza inteligencia artificial para analizar los síntomas y generar un diagnóstico de apoyo.
              Los resultados deben ser revisados por un profesional médico.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  )
}
