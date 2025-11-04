"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated } from "@/lib/auth"
import { Activity, FileText, Clock, TrendingUp, Plus, BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock statistics data
const statsData = {
  totalConsultations: 1247,
  todayConsultations: 23,
  avgResponseTime: "2.3 min",
  accuracyRate: "94.2%",
}

const chartData = [
  { day: "Lun", consultations: 45 },
  { day: "Mar", consultations: 52 },
  { day: "Mié", consultations: 38 },
  { day: "Jue", consultations: 61 },
  { day: "Vie", consultations: 48 },
  { day: "Sáb", consultations: 29 },
  { day: "Dom", consultations: 21 },
]

const recentConsultations = [
  {
    id: "1",
    patientId: "P-2024-001",
    symptoms: "Fiebre, tos seca, fatiga",
    diagnosis: "Infección respiratoria viral",
    date: "2024-01-15 14:30",
    confidence: 92,
  },
  {
    id: "2",
    patientId: "P-2024-002",
    symptoms: "Dolor abdominal, náuseas",
    diagnosis: "Gastritis aguda",
    date: "2024-01-15 13:15",
    confidence: 88,
  },
  {
    id: "3",
    patientId: "P-2024-003",
    symptoms: "Cefalea intensa, fotofobia",
    diagnosis: "Migraña",
    date: "2024-01-15 11:45",
    confidence: 95,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Panel de Control</h2>
            <p className="text-muted-foreground mt-1">Resumen de actividad y estadísticas</p>
          </div>
          <Button onClick={() => router.push("/consultation")} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nueva Consulta
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statsData.totalConsultations}</div>
              <p className="text-xs text-muted-foreground mt-1">+12% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hoy</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statsData.todayConsultations}</div>
              <p className="text-xs text-muted-foreground mt-1">Consultas realizadas hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statsData.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground mt-1">Por diagnóstico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Precisión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statsData.accuracyRate}</div>
              <p className="text-xs text-muted-foreground mt-1">Tasa de precisión</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Consultas por Día
              </CardTitle>
              <CardDescription>Actividad de la última semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  consultations: {
                    label: "Consultas",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="consultations" fill="var(--color-consultations)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          <Card>
            <CardHeader>
              <CardTitle>Consultas Recientes</CardTitle>
              <CardDescription>Últimas consultas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/results/${consultation.id}`)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{consultation.patientId}</p>
                        <span className="text-xs text-muted-foreground">{consultation.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{consultation.symptoms}</p>
                      <p className="text-sm font-medium text-primary">{consultation.diagnosis}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${consultation.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{consultation.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => router.push("/history")}>
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
