import { NextResponse } from "next/server"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { RunnableSequence } from "@langchain/core/runnables"

interface AnalysisRequest {
  currents: number[]
  voltages: number[]
  powers: number[]
  modelType: string
  temperature: number
  hydrogen: number
  oxygen: number
  RH_Cathode?: number
  RH_Anode?: number
}

interface MaxPoint {
  current: number
  power: number
  voltage: number
}

// Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
  topP: 0.8,
  apiKey: process.env.GOOGLE_API_KEY,
})

// === 1. UPDATED PROMPT TEMPLATE WITH HARDCODED CONTEXT ===
const analysisPromptTemplate = PromptTemplate.fromTemplate(`
You are a world-class fuel cell engineer and electrochemist with deep expertise in PEM (Proton Exchange Membrane) fuel cells.

## PROJECT CONTEXT & STACK CONFIGURATION:
You are analyzing data for a **High-Power PEMFC Stack** with the following fixed specifications. You must interpret all voltage and power data in this context:
* **Stack Size:** Approximately **400 individual cells** connected in series.
* **Theoretical Limits:** Max stack voltage ~500V (1.25V per cell).
* **Practical Target:** The target operating range is **0.6V - 0.7V per cell** under load.
* **Goal:** This analysis is part of a prediction tool to model performance and optimize operating conditions (temperature/flow) without the need for expensive physical testing.

## FUEL CELL OPERATING CONDITIONS:
Model Type: {modelType}
Operating Temperature: {temperature}°C
Hydrogen Flow Rate: {hydrogen} L/min
Oxygen Flow Rate: {oxygen} L/min
{humidityInfo}

## PERFORMANCE DATA SUMMARY:
Current Density Range: {currentRange} A
Cell Voltage Range: {voltageRange} V
Power Output Range: {powerRange} W

## CRITICAL PERFORMANCE POINTS:
**Maximum Power Point (MPP):**
- Power Output: {maxPower} W
- Operating Current: {maxPowerCurrent} A
- Stack Voltage: {maxPowerVoltage} V
- **Avg. Cell Voltage at MPP:** {avgCellVoltageMPP} V  (Calculated: Stack V / 400)

**Maximum Voltage Point (Open Circuit):**
- Stack Voltage: {maxVoltage} V
- **Avg. Cell OCV:** {avgCellOCV} V (Calculated: Stack V / 400)

## ANALYSIS REQUIREMENTS:

### Summary
Provide a 2-3 sentence summary. explicitly mentioning if the average cell voltage ({avgCellVoltageMPP} V) meets the practical target of 0.6-0.7V.

### Key Findings
1.  **MPP Analysis:**
    - Explain why max power occurs at {maxPowerCurrent} A.
    - Identify if this point falls in the ohmic or concentration loss region.
    
2.  **Polarization Behavior:**
    - Analyze the voltage drop from {maxVoltage} V to {maxPowerVoltage} V.
    - Reference the standard PEMFC polarization curve regions (Activation, Ohmic, Mass Transport). [Image of PEMFC polarization curve regions]

3.  **Efficiency:**
    - Discuss the voltage efficiency at MPP relative to the theoretical maximum.

### Performance Analysis
Provide technical insights on:
- **Temperature Effects:** How the {temperature}°C operating temperature impacts performance (consider Nernst equation, membrane conductivity, reaction kinetics)
- **Gas Flow Dynamics:** Assess if {hydrogen} H2 and {oxygen} O2 flow rates are optimal for {maxPowerCurrent} A operation (stoichiometry considerations)
{humidityAnalysis}
- **Limiting Factors:** Identify primary losses (activation ~0.1-0.2V, ohmic, concentration polarization)

## CRITICAL GUIDELINES:
- **Context Awareness:** Always treat the voltage data as **Stack Voltage** (sum of 400 cells).
- **Technical Rigor:** Use terms like "Concentration Polarization", "Nernst Voltage", and "Stoichiometric Ratio".
- **Always start with the heading Summary, Performance Analysis etc** 
- **Dont mention as a world class engineer or tech expert i... in the output, just get the answer like summary and others** 
`)

const analysisChain = RunnableSequence.from([
  analysisPromptTemplate,
  model,
  new StringOutputParser(),
])

// === HELPER FUNCTIONS ===
function findMaxPowerPoint(currents: number[], voltages: number[], powers: number[]): MaxPoint {
  const maxPowerIndex = powers.indexOf(Math.max(...powers))
  return {
    current: currents[maxPowerIndex],
    power: powers[maxPowerIndex],
    voltage: voltages[maxPowerIndex],
  }
}

function findMaxVoltagePoint(currents: number[], voltages: number[], powers: number[]): MaxPoint {
  const maxVoltageIndex = voltages.indexOf(Math.max(...voltages))
  return {
    current: currents[maxVoltageIndex],
    voltage: voltages[maxVoltageIndex],
    power: powers[maxVoltageIndex],
  }
}

function calculateMetrics(maxPower: MaxPoint, maxVoltage: MaxPoint) {
  const voltageDrop = maxVoltage.voltage - maxPower.voltage
  const voltageDropPercent = ((voltageDrop / maxVoltage.voltage) * 100).toFixed(1)
  const powerDensity = (maxPower.power / maxPower.current).toFixed(2)
  const efficiencyRatio = (maxPower.voltage / maxPower.power).toFixed(4)
  
  return {
    voltageDrop: voltageDrop.toFixed(3),
    voltageDropPercent,
    powerDensity,
    efficiencyRatio,
  }
}

export async function POST(request: Request) {
  try {
    const data: AnalysisRequest = await request.json()
    const { 
      currents, voltages, powers, modelType, 
      temperature, hydrogen, oxygen, 
      RH_Cathode, RH_Anode 
    } = data

    // 1. Calculate Standard Metrics
    const maxPower = findMaxPowerPoint(currents, voltages, powers)
    const maxVoltage = findMaxVoltagePoint(currents, voltages, powers)
    const metrics = calculateMetrics(maxPower, maxVoltage)

    // 2. Prepare Context Strings
    const humidityInfo = (RH_Cathode !== undefined && RH_Anode !== undefined)
      ? `Cathode RH: ${RH_Cathode}%\nAnode RH: ${RH_Anode}%`
      : "Humidity data not provided"

    const humidityRecommendation = (RH_Cathode !== undefined)
      ? `- Current RH: Cathode ${RH_Cathode}%, Anode ${RH_Anode}%\n   - Recommendation: Ensure membrane stays hydrated (approx 80-100% RH) to maintain proton conductivity.`
      : `- Not applicable for this model type.`

    // 3. Invoke AI with Calculated 400-Cell Data
    const aiAnalysis = await analysisChain.invoke({
      modelType,
      temperature,
      hydrogen,
      oxygen,
      humidityInfo,
      humidityRecommendation,
      // Formatting ranges
      currentRange: `${Math.min(...currents).toFixed(2)} - ${Math.max(...currents).toFixed(2)}`,
      voltageRange: `${Math.min(...voltages).toFixed(3)} - ${Math.max(...voltages).toFixed(3)}`,
      powerRange: `${Math.min(...powers).toFixed(2)} - ${Math.max(...powers).toFixed(2)}`,
      // Formatting MPP points
      maxPower: maxPower.power.toFixed(2),
      maxPowerCurrent: maxPower.current.toFixed(2),
      maxPowerVoltage: maxPower.voltage.toFixed(3),
      // Formatting Max Voltage points
      maxVoltage: maxVoltage.voltage.toFixed(3),
      
      // === CRITICAL: Passing Calculated Single-Cell Values ===
      // This ensures the variables in the template {avgCellVoltageMPP} have values
      avgCellVoltageMPP: (maxPower.voltage / 400).toFixed(3),
      avgCellOCV: (maxVoltage.voltage / 400).toFixed(3),
      humidityAnalysis: humidityInfo
    })

    console.log("AI Analysis generated successfully")
    console.log(aiAnalysis)
    
    return NextResponse.json({
      summary: aiAnalysis,
      maxPower,
      maxVoltage,
      metadata: { RH_Cathode, RH_Anode, metrics },
    })
  } catch (error: any) {
    console.error("Error generating AI analysis:", error)
    return NextResponse.json(
      { error: "Failed to generate AI analysis", details: error.message },
      { status: 500 }
    )
  }
}