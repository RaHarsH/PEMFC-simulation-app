"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ArrowLeft, Zap, Thermometer, Wind, Droplet, Gauge, BatteryFull } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

type PredictionPageProps = {
  params: {
    predictionId: string
  }
}

interface PredictionData {
  id: string
  modelType: string
  createdAt: Date
  temperature: number
  hydrogen: number
  oxygen: number
  currents: number[]
  voltages: number[]
  powers: number[]
}

const PredictionPage = ({ params }: PredictionPageProps) => {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const { predictionId } = params

  const fetchPredictionById = async (predictionId: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/predictions/${predictionId}`)
      const predictionData = response.data
      console.log("🟢 Fetched prediction successfully:", predictionData)

      toast.success("Fetched prediction successfully")
      setData(predictionData)
    } catch (error) {
      console.log("Failed to fetch prediction:", error)
      toast.error("Failed to fetch prediction")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictionById(predictionId)
  }, [predictionId])

  const getMaxValues = () => {
    if (!data) return { maxPower: 0, maxPowerCurrent: 0, maxVoltage: 0, maxVoltageCurrent: 0 }

    let maxPower = 0
    let maxPowerCurrent = 0
    let maxVoltage = 0
    let maxVoltageCurrent = 0

    data.powers.forEach((power, index) => {
      if (power > maxPower) {
        maxPower = power
        maxPowerCurrent = data.currents[index]
      }
    })

    data.voltages.forEach((voltage, index) => {
      if (voltage > maxVoltage) {
        maxVoltage = voltage
        maxVoltageCurrent = data.currents[index]
      }
    })

    return {
      maxPower: maxPower.toFixed(3),
      maxPowerCurrent: maxPowerCurrent.toFixed(2),
      maxVoltage: maxVoltage.toFixed(3),
      maxVoltageCurrent: maxVoltageCurrent.toFixed(2),
    }
  }

  const formatChartData = (data: PredictionData | null) => {
    if (!data) return []

    return data.currents.map((current, index) => ({
      current,
      voltage: data.voltages[index],
      power: data.powers[index],
    }))
  }

  const chartData = formatChartData(data)
  const { maxPower, maxPowerCurrent, maxVoltage, maxVoltageCurrent } = getMaxValues()


  const getModelName = (modelType: string) => {
    switch (modelType) {
      case "linear":
        return "Linear Regression"
      case "svr":
        return "Support Vector Regression (SVR)"
      case "ann":
        return "Artificial Neural Network (ANN)"
      default:
        return modelType
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleString()
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Prediction details section */}
          <div className="w-full lg:w-1/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Prediction Details</CardTitle>
                <CardDescription>
                  {loading ? <Skeleton className="h-4 w-40" /> : data && `Created on ${formatDate(data.createdAt)}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : data ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Model Type</p>
                        <p className="font-medium">{getModelName(data.modelType)}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                          <Thermometer className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Temperature</p>
                          <p className="font-medium">{data.temperature} °C</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                          <Wind className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hydrogen flow rate</p>
                          <p className="font-medium">{data.hydrogen}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                          <Droplet className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Oxygen flow rate</p>
                          <p className="font-medium">{data.oxygen}%</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Maximum Values</h3>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                          <BatteryFull className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Maximum Voltage</p>
                          <p className="font-medium">
                            {maxVoltage} V at {maxVoltageCurrent} A
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                          <Gauge className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Maximum Power</p>
                          <p className="font-medium">
                            {maxPower} W at {maxPowerCurrent} A
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Data Points</h3>
                      <p className="text-sm text-muted-foreground">
                        {data.currents.length} data points from {Math.min(...data.currents).toFixed(2)} A to{" "}
                        {Math.max(...data.currents).toFixed(2)} A
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">Failed to load prediction data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right side - Graphs section */}
          <div className="w-full lg:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
                <CardDescription>
                  {loading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : data ? (
                    `Results using ${getModelName(data.modelType)} model`
                  ) : (
                    "No data available"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-[300px] w-full rounded-md" />
                    <Skeleton className="h-8 w-40 rounded-md mx-auto" />
                  </div>
                ) : data ? (
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
                      <p className="text-sm">The requested prediction could not be found</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PredictionPage
