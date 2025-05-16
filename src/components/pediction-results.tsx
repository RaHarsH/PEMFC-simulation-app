"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type PredictionData = {
  currents: number[]
  voltages: number[]
  powers: number[]
  modelType: string
}

export function PredictionResults() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handlePredictionUpdate = (event: CustomEvent<PredictionData>) => {
      setLoading(true)

      // Simulate loading delay
      setTimeout(() => {
        setPredictionData(event.detail)
        setLoading(false)
      }, 1000)
    }

    // Add event listener
    window.addEventListener("prediction-updated", handlePredictionUpdate as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("prediction-updated", handlePredictionUpdate as EventListener)
    }
  }, [])

  // Format data for charts
  const formatChartData = (data: PredictionData | null) => {
    if (!data) return []

    return data.currents.map((current, index) => ({
      current,
      voltage: data.voltages[index],
      power: data.powers[index],
    }))
  }

  const chartData = formatChartData(predictionData)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Prediction Results</CardTitle>
        <CardDescription>
          {predictionData
            ? `Results using ${
                predictionData.modelType === "linear"
                  ? "Linear Regression"
                  : predictionData.modelType === "svr"
                    ? "Support Vector Regression"
                    : "Artificial Neural Network"
              } model`
            : "Run a prediction to see results"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-md" />
            <Skeleton className="h-8 w-40 rounded-md mx-auto" />
          </div>
        ) : predictionData ? (
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
  )
}
