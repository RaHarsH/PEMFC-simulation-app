"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Lightbulb, TrendingUp, Zap, AlertCircle, Loader2, Maximize2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { AIAnalysisDialog } from "@/components/ai-analysis-dialog"

type PredictionData = {
  currents: number[]
  voltages: number[]
  powers: number[]
  modelType: string
  temperature?: number
  hydrogen?: number
  oxygen?: number
  RH_Cathode?: number
  RH_Anode?: number
}

type AnalysisData = {
  summary: string
  maxPower: {
    current: number
    power: number
    voltage: number
  }
  maxVoltage: {
    current: number
    voltage: number
    power: number
  }
  metadata?: {
    RH_Cathode?: number
    RH_Anode?: number
    metrics?: any
  }
}

export function PredictionResults() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  useEffect(() => {
    const handlePredictionUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent<PredictionData>
      const data = customEvent.detail
      
      console.log("Received prediction data:", data)
      
      setLoadingPrediction(true)
      setAnalysisData(null)
      setAnalysisError(null)

      // Simulate minimal loading for smooth transition
      setTimeout(() => {
        setPredictionData(data)
        setLoadingPrediction(false)
        
        // Start loading AI analysis in background
        fetchAIAnalysis(data)
      }, 500)
    }

    window.addEventListener("prediction-updated", handlePredictionUpdate)

    return () => {
      window.removeEventListener("prediction-updated", handlePredictionUpdate)
    }
  }, [])

  const fetchAIAnalysis = async (data: PredictionData) => {
    setLoadingAnalysis(true)
    setAnalysisError(null)
    
    console.log("Fetching AI analysis with data:", {
      modelType: data.modelType,
      temperature: data.temperature,
      hydrogen: data.hydrogen,
      oxygen: data.oxygen,
    })

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currents: data.currents,
          voltages: data.voltages,
          powers: data.powers,
          modelType: data.modelType,
          temperature: data.temperature,
          hydrogen: data.hydrogen,
          oxygen: data.oxygen,
          RH_Cathode: data.RH_Cathode,
          RH_Anode: data.RH_Anode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate AI analysis')
      }

      const analysis = await response.json()
      console.log("AI analysis received:", analysis)
      setAnalysisData(analysis)
    } catch (error: any) {
      console.error('Error fetching AI analysis:', error)
      setAnalysisError(error.message || 'Failed to generate AI analysis')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Format data for displaying in charts
  const formatChartData = (data: PredictionData | null) => {
    if (!data) return []

    return data.currents.map((current, index) => ({
      current,
      voltage: data.voltages[index],
      power: data.powers[index],
    }))
  }

  // Get preview of AI analysis (first 300 characters of summary)
  const getAnalysisPreview = (summary: string) => {
    const summarySection = summary.split('###').find((s) => s.trim().startsWith('Summary'))
    if (!summarySection) return summary.substring(0, 300) + "..."
    
    const summaryText = summarySection.replace('Summary', '').trim()
    const preview = summaryText.substring(0, 300)
    return preview.length < summaryText.length ? preview + "..." : preview
  }

  const chartData = formatChartData(predictionData)

  const getModelName = (type: string) => {
    switch (type) {
      case "linear":
        return "Linear Regression"
      case "svr":
        return "Support Vector Regression"
      case "ann":
        return "Artificial Neural Network"
      case "stack_model":
        return "Stack Model"
      default:
        return type
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Prediction Results</CardTitle>
          <CardDescription>
            {predictionData
              ? `Results using ${getModelName(predictionData.modelType)} model`
              : "Run a prediction to see results"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPrediction ? (
            <div className="space-y-6">
              <Skeleton className="h-[300px] w-full rounded-md" />
              <Skeleton className="h-8 w-40 rounded-md mx-auto" />
            </div>
          ) : predictionData ? (
            <div className="space-y-6">
              {/* Charts Section - Shows immediately */}
              <Tabs defaultValue="voltage">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="voltage">Voltage Curve</TabsTrigger>
                  <TabsTrigger value="power">Power Curve</TabsTrigger>
                </TabsList>
                <TabsContent value="voltage" className="pt-4">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="current"
                          label={{ value: "Current (A)", position: "insideBottomRight", offset: -5 }}
                        />
                        <YAxis label={{ value: "Voltage (V)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e2f", borderColor: "#2d2d3f" }}
                          formatter={(value: number) => [value.toFixed(3) + " V", "Voltage"]}
                          labelFormatter={(value) => `Current: ${value} A`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="voltage"
                          name="Voltage"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="power" className="pt-4">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="current"
                          label={{ value: "Current (A)", position: "insideBottomRight", offset: -5 }}
                        />
                        <YAxis label={{ value: "Power (W)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e2f", borderColor: "#2d2d3f" }}
                          formatter={(value: number) => [value.toFixed(3) + " W", "Power"]}
                          labelFormatter={(value) => `Current: ${value} A`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="power"
                          name="Power"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>

              {/* AI Analysis Section - Loads after graphs */}
              <div className="space-y-4 mt-8">
                {loadingAnalysis ? (
                  // Loading state for AI analysis
                  <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                        Generating AI Analysis...
                      </CardTitle>
                      <CardDescription>
                        Our AI is analyzing your fuel cell performance data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <Skeleton className="h-4 w-full mt-4" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-3/6" />
                    </CardContent>
                  </Card>
                ) : analysisError ? (
                  // Error state
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold">Failed to generate AI analysis</span>
                        <span className="text-sm">{analysisError}</span>
                        <button
                          onClick={() => fetchAIAnalysis(predictionData)}
                          className="text-sm underline hover:no-underline mt-2 text-left"
                        >
                          Try again
                        </button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : analysisData ? (
                  // Analysis loaded successfully
                  <>
                    {/* Key Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              Maximum Power Point
                            </CardTitle>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                              Optimal
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-400">
                              {analysisData.maxPower.power.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">W</span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              at <span className="font-medium text-foreground">{analysisData.maxPower.current.toFixed(2)} A</span>
                            </p>
                            <p>
                              Voltage: <span className="font-medium text-foreground">{analysisData.maxPower.voltage.toFixed(2)} V</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-500/20 bg-green-500/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              Maximum Voltage Point
                            </CardTitle>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                              Peak
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-green-400">
                              {analysisData.maxVoltage.voltage.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">V</span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              at <span className="font-medium text-foreground">{analysisData.maxVoltage.current.toFixed(2)} A</span>
                            </p>
                            <p>
                              Power: <span className="font-medium text-foreground">{analysisData.maxVoltage.power.toFixed(2)} W</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* AI Insights Preview */}
                    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-purple-400" />
                              AI-Powered Analysis
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Quick overview of performance insights
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFullAnalysis(true)}
                            className="flex items-center gap-2"
                          >
                            <Maximize2 className="h-4 w-4" />
                            View Full Analysis
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="text-muted-foreground leading-relaxed my-2">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-foreground font-semibold">
                                  {children}
                                </strong>
                              ),
                            }}
                          >
                            {getAnalysisPreview(analysisData.summary)}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Operating Conditions */}
                    {(predictionData.temperature !== undefined || 
                      predictionData.hydrogen !== undefined || 
                      predictionData.oxygen !== undefined) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {predictionData.temperature !== undefined && (
                              <span>
                                <strong>Temperature:</strong> {predictionData.temperature}°C
                              </span>
                            )}
                            {predictionData.hydrogen !== undefined && (
                              <span>
                                <strong>H₂ Flow:</strong> {predictionData.hydrogen} L/min
                              </span>
                            )}
                            {predictionData.oxygen !== undefined && (
                              <span>
                                <strong>O₂ Flow:</strong> {predictionData.oxygen} L/min
                              </span>
                            )}
                            {predictionData.RH_Cathode !== undefined && (
                              <span>
                                <strong>RH Cathode:</strong> {predictionData.RH_Cathode}%
                              </span>
                            )}
                            {predictionData.RH_Anode !== undefined && (
                              <span>
                                <strong>RH Anode:</strong> {predictionData.RH_Anode}%
                              </span>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <div className="text-muted-foreground">
                <p className="mb-2">No prediction data available</p>
                <p className="text-sm">Use the form on the left to run a prediction</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Analysis Modal */}
      <AIAnalysisDialog
        open={showFullAnalysis}
        onOpenChange={setShowFullAnalysis}
        analysisData={analysisData}
        operatingConditions={predictionData ? {
          temperature: predictionData.temperature,
          hydrogen: predictionData.hydrogen,
          oxygen: predictionData.oxygen,
          RH_Cathode: predictionData.RH_Cathode,
          RH_Anode: predictionData.RH_Anode,
          modelType: predictionData.modelType,
        } : undefined}
      />
    </>
  )
}