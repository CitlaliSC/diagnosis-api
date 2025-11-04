"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAuthenticated } from "@/lib/auth"
import { ArrowLeft, Search, Calendar, TrendingUp, Filter, FileText, Eye } from "lucide-react"

interface HistoryItem {
  id: string
  patientId: string
  diagnosis: string
  confidence: number
  date: string
  urgency: "low" | "moderate" | "high"
  symptoms: string
}

// Mock history data
const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "DIAG-1737820800000",
    patientId: "P-2024-015",
    diagnosis: "Infección respiratoria viral",
    confidence: 92,
    date: "2024-01-25T14:30:00",
    urgency: "moderate",
    symptoms: "Fiebre, tos seca, fatiga",
  },
  {
    id: "DIAG-1737734400000",
    patientId: "P-2024-014",
    diagnosis: "Gastritis aguda",
    confidence: 88,
    date: "2024-01-24T11:15:00",
    urgency: "low",
    symptoms: "Dolor abdominal, náuseas",
  },
  {
    id: "DIAG-1737648000000",
    patientId: "P-2024-013",
    diagnosis: "Migraña",
    confidence: 95,
    date: "2024-01-23T16:45:00",
    urgency: "moderate",
    symptoms: "Cefalea intensa, fotofobia",
  },
  {
    id: "DIAG-1737561600000",
    patientId: "P-2024-012",
    diagnosis: "Hipertensión arterial",
    confidence: 91,
    date: "2024-01-22T09:20:00",
    urgency: "high",
    symptoms: "Presión arterial elevada, mareos",
  },
  {
    id: "DIAG-1737475200000",
    patientId: "P-2024-011",
    diagnosis: "Faringitis bacteriana",
    confidence: 87,
    date: "2024-01-21T13:50:00",
    urgency: "moderate",
    symptoms: "Dolor de garganta, fiebre",
  },
  {
    id: "DIAG-1737388800000",
    patientId: "P-2024-010",
    diagnosis: "Dermatitis de contacto",
    confidence: 93,
    date: "2024-01-20T10:30:00",
    urgency: "low",
    symptoms: "Erupción cutánea, picazón",
  },
  {
    id: "DIAG-1737302400000",
    patientId: "P-2024-009",
    diagnosis: "Bronquitis aguda",
    confidence: 89,
    date: "2024-01-19T15:10:00",
    urgency: "moderate",
    symptoms: "Tos productiva, dificultad respiratoria",
  },
  {
    id: "DIAG-1737216000000",
    patientId: "P-2024-008",
    diagnosis: "Conjuntivitis viral",
    confidence: 94,
    date: "2024-01-18T08:40:00",
    urgency: "low",
    symptoms: "Ojos rojos, lagrimeo",
  },
]

export default function HistoryPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    // Load history from localStorage and merge with mock data
    const storedDiagnoses: HistoryItem[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("diagnosis_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "")
          storedDiagnoses.push({
            id: data.id,
            patientId: data.consultation.patientId,
            diagnosis: data.diagnosis.primary,
            confidence: data.diagnosis.confidence,
            date: data.timestamp,
            urgency: data.diagnosis.urgency,
            symptoms: data.consultation.mainSymptom,
          })
        } catch (e) {
          // Skip invalid entries
        }
      }
    }

    // Combine and deduplicate
    const allHistory = [...storedDiagnoses, ...MOCK_HISTORY]
    const uniqueHistory = Array.from(new Map(allHistory.map((item) => [item.id, item])).values())
    setHistory(uniqueHistory)
    setFilteredHistory(uniqueHistory)
  }, [router])

  useEffect(() => {
    let filtered = [...history]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.symptoms.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter((item) => item.urgency === urgencyFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "confidence-desc":
          return b.confidence - a.confidence
        case "confidence-asc":
          return a.confidence - b.confidence
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }, [searchQuery, urgencyFilter, sortBy, history])

  if (!mounted) {
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
        return "Alta"
      case "moderate":
        return "Moderada"
      case "low":
        return "Baja"
      default:
        return "Normal"
    }
  }

  const stats = {
    total: history.length,
    highUrgency: history.filter((h) => h.urgency === "high").length,
    avgConfidence:
      history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.confidence, 0) / history.length) : 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <h2 className="text-3xl font-bold text-foreground">Historial de Consultas</h2>
          <p className="text-muted-foreground mt-1">Registro completo de diagnósticos realizados</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Consultas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Casos de Alta Prioridad</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.highUrgency}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confianza Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.avgConfidence}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, diagnóstico o síntomas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por urgencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las urgencias</SelectItem>
                  <SelectItem value="high">Alta prioridad</SelectItem>
                  <SelectItem value="moderate">Prioridad moderada</SelectItem>
                  <SelectItem value="low">Prioridad baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más reciente primero</SelectItem>
                  <SelectItem value="date-asc">Más antiguo primero</SelectItem>
                  <SelectItem value="confidence-desc">Mayor confianza</SelectItem>
                  <SelectItem value="confidence-asc">Menor confianza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Registradas</CardTitle>
            <CardDescription>
              {filteredHistory.length} {filteredHistory.length === 1 ? "resultado" : "resultados"} encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron consultas</h3>
                <p className="text-muted-foreground">Intente ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/results/${item.id}`)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{item.patientId}</h3>
                            <Badge variant={getUrgencyColor(item.urgency) as any} className="text-xs">
                              {getUrgencyLabel(item.urgency)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{item.symptoms}</p>
                          <p className="text-sm font-medium text-primary">{item.diagnosis}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(item.date).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 max-w-xs bg-muted rounded-full h-2">
                            <div
                              className="bg-success h-2 rounded-full transition-all"
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2 bg-transparent">
                          <Eye className="h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
