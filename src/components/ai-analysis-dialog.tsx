"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  TrendingUp,
  Zap,
  Settings,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

interface AIAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysisData: {
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
  } | null
  operatingConditions?: {
    temperature?: number
    hydrogen?: number
    oxygen?: number
    RH_Cathode?: number
    RH_Anode?: number
    modelType?: string
  }
}

export function AIAnalysisDialog({
  open,
  onOpenChange,
  analysisData,
  operatingConditions,
}: AIAnalysisDialogProps) {
  if (!analysisData) return null

  // --- 1. CLEANING & PARSING LOGIC ---
  
  // Remove the [0] artifacts and extra whitespace
  const cleanSummary = analysisData.summary
    .replace(/\[\d+\]/g, "") // Remove [0], [1], etc.
    .replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
    .trim()

  // Split by either "## " or "### " (handling potential spaces before #)
  const sections = cleanSummary.split(/(?:\n|^)\s*#{2,3}\s+/).filter(Boolean)

  // Robust helper to find sections regardless of exact casing or whitespace
  const getSection = (keyword: string) =>
    sections.find((s) => s.trim().toLowerCase().startsWith(keyword.toLowerCase()))

  const summarySection = getSection("Summary")
  const keyFindingsSection = getSection("Key Findings")
  const performanceSection = getSection("Performance Analysis")
  const recommendationsSection = getSection("Recommendations")
  const additionalSection = getSection("Additional")

  // --- 2. STYLING LOGIC ---
  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      components={{
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-foreground mt-4 mb-3 flex items-center gap-2">
            <span className="text-primary">▸</span>
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-foreground mt-3 mb-2">
            {children}
          </h4>
        ),
        // Fix for alignment: remove list-inside, add padding-left, force paragraphs to have no margin
        ul: ({ children }) => (
          <ul className="my-3 list-disc pl-5 space-y-1 [&_p]:!my-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 list-decimal pl-5 space-y-1 [&_p]:!my-0">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-muted-foreground leading-relaxed text-sm pl-1">
            {children}
          </li>
        ),
        p: ({ children }) => (
          <p className="text-muted-foreground leading-relaxed my-2 text-sm">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="text-foreground font-semibold">
            {children}
          </strong>
        ),
        code: ({ children }) => (
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 my-3 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )

  const getModelName = (type?: string) => {
    switch (type) {
      case "linear": return "Linear Regression"
      case "svr": return "Support Vector Regression"
      case "ann": return "Artificial Neural Network"
      case "stack_model": return "Stack Model"
      default: return type || "Unknown"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI-Powered Fuel Cell Analysis
          </DialogTitle>
          <DialogDescription>
            Comprehensive performance analysis and optimization recommendations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="px-6 pb-6">
          <TabsList className="w-full mb-4 grid grid-cols-4">
            <TabsTrigger value="summary" className="flex gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="findings" className="flex gap-2">
              <Zap className="h-4 w-4" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex gap-2">
              <Settings className="h-4 w-4" />
              Conditions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] pr-4">
            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-0">
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-medium">Maximum Power Point</h3>
                      </div>
                      <div className="space-y-2">
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-medium">Maximum Voltage Point</h3>
                      </div>
                      <div className="space-y-2">
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
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Content */}
                {summarySection ? (
                  <Card>
                    <CardContent className="pt-6">
                      {/* Remove the redundant title if needed, or render as is */}
                      {renderMarkdown(summarySection.replace(/^Summary\s*/i, ""))}
                    </CardContent>
                  </Card>
                ) : (
                    <Card><CardContent className="pt-6 text-muted-foreground">Analysis summary parsing failed. Raw data might be malformed.</CardContent></Card>
                )}
              </div>
            </TabsContent>

            {/* Key Findings Tab */}
            <TabsContent value="findings" className="mt-0">
              <div className="space-y-4">
                {keyFindingsSection ? (
                  <Card>
                    <CardContent className="pt-6">
                      {renderMarkdown(keyFindingsSection.replace(/^Key Findings\s*/i, ""))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">No key findings section available in the analysis.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Performance Analysis Tab */}
            <TabsContent value="performance" className="mt-0">
              <div className="space-y-4">
                {performanceSection ? (
                  <Card>
                    <CardContent className="pt-6">
                      {renderMarkdown(performanceSection.replace(/^Performance Analysis\s*/i, ""))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">No performance analysis section available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Operating Conditions Tab */}
            <TabsContent value="conditions" className="mt-0">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Operating Conditions</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {operatingConditions?.modelType && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Model Type</span>
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {getModelName(operatingConditions.modelType)}
                          </Badge>
                        </div>
                      )}
                      
                      {operatingConditions?.temperature !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Temperature</span>
                          <span className="text-sm text-muted-foreground">
                            {operatingConditions.temperature}°C
                          </span>
                        </div>
                      )}
                      
                      {operatingConditions?.hydrogen !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Hydrogen Flow Rate</span>
                          <span className="text-sm text-muted-foreground">
                            {operatingConditions.hydrogen} L/min
                          </span>
                        </div>
                      )}
                      
                      {operatingConditions?.oxygen !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Oxygen Flow Rate</span>
                          <span className="text-sm text-muted-foreground">
                            {operatingConditions.oxygen} L/min
                          </span>
                        </div>
                      )}
                      
                      {operatingConditions?.RH_Cathode !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Cathode Relative Humidity</span>
                          <span className="text-sm text-muted-foreground">
                            {operatingConditions.RH_Cathode}%
                          </span>
                        </div>
                      )}
                      
                      {operatingConditions?.RH_Anode !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Anode Relative Humidity</span>
                          <span className="text-sm text-muted-foreground">
                            {operatingConditions.RH_Anode}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics Card */}
                {analysisData.metadata?.metrics && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Performance Metrics</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Voltage Drop from Max</span>
                          <span className="text-sm text-muted-foreground">
                            {analysisData.metadata.metrics.voltageDrop} V ({analysisData.metadata.metrics.voltageDropPercent}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Power Density at MPP</span>
                          <span className="text-sm text-muted-foreground">
                            {analysisData.metadata.metrics.powerDensity} W/A
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm font-medium">Efficiency Ratio (V/P at MPP)</span>
                          <span className="text-sm text-muted-foreground">
                            {analysisData.metadata.metrics.efficiencyRatio}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex items-center justify-between p-4 border-t bg-muted/40">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>AI-generated analysis based on fuel cell performance data</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}