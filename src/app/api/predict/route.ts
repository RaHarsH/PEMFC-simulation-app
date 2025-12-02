import { NextResponse } from "next/server"
import axios from "axios"

interface PredictionPayload {
  model_type: string
  I: number[]
  T: number
  Hydrogen: number
  Oxygen: number
  RH_Cathode?: number
  RH_Anode?: number
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { modelType, currents, temperature, hydrogen, oxygen, RH_Cathode, RH_Anode } = data

    console.log("Processing prediction request:", { modelType, temperature })

    const payload: PredictionPayload = {
      model_type: modelType,
      I: currents,
      T: temperature,
      Hydrogen: hydrogen,
      Oxygen: oxygen,
    }

    if (modelType === "linear" || modelType === "ann" || modelType === "stack_model") {
      payload.RH_Cathode = RH_Cathode
      payload.RH_Anode = RH_Anode
    }

    // Get predictions from FastAPI backend - FAST response
    const response = await axios.post("http://127.0.0.1:8000/predict-output", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    })

    const result = response.data

    console.log("Prediction completed successfully")
    console.log(result, data)

    // Return only prediction data - AI analysis will be requested separately
    return NextResponse.json({
      currents: result.currents,
      voltages: result.voltages,
      powers: result.powers,
      modelType: data.modelType,
      temperature: data.temperature,
      hydrogen: data.hydrogen,
      oxygen: data.oxygen,
      RH_Cathode,
      RH_Anode,
    })
  } catch (error: any) {
    console.error("Error in prediction:", error)

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: "Cannot connect to prediction service. Please ensure the FastAPI backend is running." },
          { status: 503 }
        )
      }
      const status = error.response?.status || 500
      const message = error.response?.data?.detail || "Prediction service error"
      return NextResponse.json({ error: message }, { status })
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}