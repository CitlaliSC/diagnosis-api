"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { isAuthenticated } from "@/lib/auth"
import {
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Stethoscope,
  Pill,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DiagnosisResult {
  id: string
  consultation: any
  timestamp: string
  diagnosis: {
    primary: string
    confidence: number
    confidenceLevel: string // Added confidence level from API
    alternatives: Array<{ condition: string; confidence: number }>
    recommendations: string[]
    urgency: "low" | "moderate" | "high"
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Load diagnosis result
    const diagnosisId = params.id as string
    const storedResult = localStorage.getItem(`diagnosis_${diagnosisId}`)
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    } else {
      // If no result found, redirect to dashboard
      router.push("/dashboard")
    }
  }, [params.id, router])

  if (!mounted || !result) {
    return null
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "moderate":
        return "warning"
      case "low":
        return "success"
      default:
        return "secondary"
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Alta Prioridad"
      case "moderate":
        return "Prioridad Moderada"
      case "low":
        return "Prioridad Baja"
      default:
        return "Normal"
    }
  }

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case "high":
        return (
          <Badge variant="default" className="bg-success">
            Alta Confianza (≥80%)
          </Badge>
        )
      case "medium":
        return <Badge variant="secondary">Confianza Media (60-79%)</Badge>
      case "low":
        return <Badge variant="outline">Confianza Baja (&lt;60%)</Badge>
      default:
        return null
    }
  }

  const handleDownload = () => {
    const reportContent = `
INFORME DE DIAGNÓSTICO MÉDICO
================================

ID de Diagnóstico: ${result.id}
Fecha: ${new Date(result.timestamp).toLocaleString("es-ES")}

INFORMACIÓN DEL PACIENTE
------------------------
Nombre: ${result.consultation.name}
Edad: ${result.consultation.age} años
Género: ${result.consultation.gender}
Teléfono: ${result.consultation.phone}

SÍNTOMAS REPORTADOS
-------------------
Fiebre: ${result.consultation.fever}
Tos: ${result.consultation.cough}
Fatiga: ${result.consultation.fatigue}
Dificultad para respirar: ${result.consultation.difficulty_breathing}

SIGNOS VITALES
--------------
Presión Arterial: ${result.consultation.blood_pressure_raw || "N/A"} mmHg (${result.consultation.blood_pressure})
Nivel de Colesterol: ${result.consultation.cholesterol_raw || "N/A"} mg/dL (${result.consultation.cholesterol_level})

NOTAS ADICIONALES
-----------------
${result.consultation.notes || "Sin notas adicionales"}

DIAGNÓSTICO PRINCIPAL
---------------------
${result.diagnosis.primary}
Nivel de Confianza: ${result.diagnosis.confidence.toFixed(2)}% (${result.diagnosis.confidenceLevel})

DIAGNÓSTICOS ALTERNATIVOS
-------------------------
${result.diagnosis.alternatives.map((alt) => `- ${alt.condition} (${typeof alt.confidence === "number" ? alt.confidence.toFixed(2) : alt.confidence}%)`).join("\n")}

RECOMENDACIONES
---------------
${result.diagnosis.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join("\n")}

URGENCIA: ${getUrgencyLabel(result.diagnosis.urgency)}

================================
Este informe es generado por un sistema de apoyo diagnóstico con IA.
Debe ser revisado y validado por un profesional médico.
API: http://localhost:8000
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `diagnostico_${result.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Resultados del Diagnóstico</h2>
              <p className="text-muted-foreground mt-1">ID: {result.id}</p>
            </div>
            <Button onClick={handleDownload} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Descargar Informe
            </Button>
          </div>
        </div>

        {/* Urgency Alert */}
        {result.diagnosis.urgency === "high" && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atención Urgente Requerida</AlertTitle>
            <AlertDescription>
              Este caso requiere atención médica inmediata. Por favor, proceda con el tratamiento apropiado lo antes
              posible.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Diagnosis */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Diagnóstico Principal</CardTitle>
                      <CardDescription>Resultado del análisis de síntomas con IA</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={getUrgencyColor(result.diagnosis.urgency) as any}>
                      {getUrgencyLabel(result.diagnosis.urgency)}
                    </Badge>
                    {getConfidenceBadge(result.diagnosis.confidenceLevel)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{result.diagnosis.primary}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Probabilidad:</span>
                    <div className="flex-1 max-w-xs bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full transition-all"
                        style={{ width: `${result.diagnosis.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {result.diagnosis.confidence.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Diagnósticos Alternativos
                  </h4>
                  <div className="space-y-3">
                    {result.diagnosis.alternatives.map((alt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium text-foreground">{alt.condition}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div className="bg-chart-2 h-2 rounded-full" style={{ width: `${alt.confidence}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {typeof alt.confidence === "number" ? alt.confidence.toFixed(2) : alt.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Recomendaciones de Tratamiento
                  </h4>
                  <ul className="space-y-2">
                    {result.diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Patient Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Síntomas y Signos Vitales Reportados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Síntomas</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">Fiebre</span>
                      <Badge variant={result.consultation.fever === "Yes" ? "default" : "outline"}>
                        {result.consultation.fever}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">Tos</span>
                      <Badge variant={result.consultation.cough === "Yes" ? "default" : "outline"}>
                        {result.consultation.cough}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">Fatiga</span>
                      <Badge variant={result.consultation.fatigue === "Yes" ? "default" : "outline"}>
                        {result.consultation.fatigue}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">Dificultad respiratoria</span>
                      <Badge variant={result.consultation.difficulty_breathing === "Yes" ? "default" : "outline"}>
                        {result.consultation.difficulty_breathing}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Signos Vitales</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-sm text-muted-foreground">Presión Arterial</span>
                      <p className="font-medium">{result.consultation.blood_pressure_raw || "N/A"} mmHg</p>
                      <p className="text-xs text-muted-foreground">{result.consultation.blood_pressure}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-sm text-muted-foreground">Colesterol</span>
                      <p className="font-medium">{result.consultation.cholesterol_raw || "N/A"} mg/dL</p>
                      <p className="text-xs text-muted-foreground">{result.consultation.cholesterol_level}</p>
                    </div>
                  </div>
                </div>
                {result.consultation.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Notas Adicionales</h4>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{result.consultation.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium text-foreground">{result.consultation.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium text-foreground">{result.consultation.age} años</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium text-foreground">{result.consultation.gender}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-foreground">{result.consultation.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Información de Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium text-foreground">
                    {new Date(result.timestamp).toLocaleString("es-ES", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* API Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">API Endpoint</p>
                  <p className="font-mono text-xs text-foreground break-all">http://localhost:8000/api/predict</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Nivel de Confianza</p>
                  <p className="font-medium text-foreground capitalize">{result.diagnosis.confidenceLevel}</p>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Aviso Importante</AlertTitle>
              <AlertDescription className="text-xs">
                Este diagnóstico es generado por IA y debe ser revisado por un profesional médico calificado antes de
                tomar cualquier decisión de tratamiento.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    </div>
  )
}
