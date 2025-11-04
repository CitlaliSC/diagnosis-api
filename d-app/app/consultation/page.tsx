"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { isAuthenticated } from "@/lib/auth"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

interface ConsultationData {
  name: string
  age: string
  gender: string
  phone: string
  blood_pressure: string
  cholesterol_level: string
  fever: string
  cough: string
  fatigue: string
  difficulty_breathing: string
  notes: string
}

const API_SYMPTOMS = [
  { id: "fever", label: "Fiebre" },
  { id: "cough", label: "Tos" },
  { id: "fatigue", label: "Fatiga" },
  { id: "difficulty_breathing", label: "Dificultad para respirar" },
]

export default function ConsultationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<ConsultationData>({
    name: "",
    age: "",
    gender: "",
    phone: "",
    blood_pressure: "",
    cholesterol_level: "",
    fever: "No",
    cough: "No",
    fatigue: "No",
    difficulty_breathing: "No",
    notes: "",
  })

  const [bloodPressureSystolic, setBloodPressureSystolic] = useState("")
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState("")
  const [cholesterolValue, setCholesterolValue] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  if (!mounted) {
    return null
  }

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const getBloodPressureCategory = (systolic: number, diastolic: number): string => {
    if (systolic >= 140 || diastolic >= 90) return "High"
    if (systolic < 90 || diastolic < 60) return "Low"
    return "Normal"
  }

  const getCholesterolCategory = (value: number): string => {
    if (value >= 240) return "High"
    if (value < 200) return "Normal"
    return "Normal"
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setIsProcessing(true)

    const systolic = Number.parseInt(bloodPressureSystolic)
    const diastolic = Number.parseInt(bloodPressureDiastolic)
    const cholesterol = Number.parseInt(cholesterolValue)

    const finalData = {
      ...formData,
      blood_pressure: getBloodPressureCategory(systolic, diastolic),
      cholesterol_level: getCholesterolCategory(cholesterol),
      blood_pressure_raw: `${bloodPressureSystolic}/${bloodPressureDiastolic}`,
      cholesterol_raw: cholesterolValue,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("currentConsultation", JSON.stringify(finalData))
    }
    setTimeout(() => {
      router.push("/diagnosis")
    }, 500)
  }

  const toggleSymptom = (symptomId: string) => {
    setFormData((prev) => ({
      ...prev,
      [symptomId]: prev[symptomId as keyof ConsultationData] === "Yes" ? "No" : "Yes",
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.age && formData.gender && formData.phone
      case 2:
        return bloodPressureSystolic && bloodPressureDiastolic && cholesterolValue
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <h2 className="text-3xl font-bold text-foreground">Nueva Consulta</h2>
          <p className="text-muted-foreground mt-1">Complete la información del paciente paso a paso</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Datos Generales del Paciente"}
              {currentStep === 2 && "Presión Arterial y Colesterol"}
              {currentStep === 3 && "Síntomas y Notas"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Información básica del paciente"}
              {currentStep === 2 && "Signos vitales del paciente"}
              {currentStep === 3 && "Síntomas presentes y observaciones adicionales"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez García"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Edad *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="35"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+52 123 456 7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Género *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">
                        Femenino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Presión Arterial (mmHg) *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="systolic" className="text-sm text-muted-foreground">
                          Sistólica
                        </Label>
                        <Input
                          id="systolic"
                          type="number"
                          placeholder="120"
                          value={bloodPressureSystolic}
                          onChange={(e) => setBloodPressureSystolic(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diastolic" className="text-sm text-muted-foreground">
                          Diastólica
                        </Label>
                        <Input
                          id="diastolic"
                          type="number"
                          placeholder="80"
                          value={bloodPressureDiastolic}
                          onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                        />
                      </div>
                    </div>
                    {bloodPressureSystolic && bloodPressureDiastolic && (
                      <p className="text-sm text-muted-foreground">
                        Categoría:{" "}
                        <span className="font-medium">
                          {getBloodPressureCategory(
                            Number.parseInt(bloodPressureSystolic),
                            Number.parseInt(bloodPressureDiastolic),
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cholesterol">Nivel de Colesterol (mg/dL) *</Label>
                    <Input
                      id="cholesterol"
                      type="number"
                      placeholder="200"
                      value={cholesterolValue}
                      onChange={(e) => setCholesterolValue(e.target.value)}
                    />
                    {cholesterolValue && (
                      <p className="text-sm text-muted-foreground">
                        Categoría:{" "}
                        <span className="font-medium">{getCholesterolCategory(Number.parseInt(cholesterolValue))}</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Síntomas Presentes</Label>
                  <p className="text-sm text-muted-foreground mb-4">Seleccione los síntomas que presenta el paciente</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {API_SYMPTOMS.map((symptom) => (
                      <div key={symptom.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom.id}
                          checked={formData[symptom.id as keyof ConsultationData] === "Yes"}
                          onCheckedChange={() => toggleSymptom(symptom.id)}
                        />
                        <Label htmlFor={symptom.id} className="font-normal cursor-pointer">
                          {symptom.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones, historial médico relevante, medicamentos actuales, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluya cualquier información adicional que considere relevante para el diagnóstico
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isProcessing}
                className="bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={handleNext} disabled={!canProceed() || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : currentStep === totalSteps ? (
                  "Iniciar Diagnóstico"
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
