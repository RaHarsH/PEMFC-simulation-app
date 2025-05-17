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

    const { modelType, currents, temperature, hydrogen, oxygen, RH_Cathode, RH_Anode} = data

    console.log("Currents:", currents)

    const payload: PredictionPayload = {
      model_type: modelType,
      I: currents,
      T: temperature,
      Hydrogen: hydrogen,
      Oxygen: oxygen,
    }

    if (modelType === "linear" || modelType === "ann") {
      payload.RH_Cathode = RH_Cathode
      payload.RH_Anode = RH_Anode
    }

    const response = await axios.post("http://127.0.0.1:8000/predict-output", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const result = response.data

    return NextResponse.json({
      currents: result.currents,
      voltages: result.voltages,
      powers: result.powers,
      modelType: data.modelType,
      temperature: data.temperature,
      hydrogen: data.hydrogen,
      oxygen: data.oxygen,
    })
  } catch (error: any) {
    console.error("Error communicating with FastAPI:", error)

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500
      const message = error.response?.data?.detail || "Prediction service error"
      return NextResponse.json({ error: message }, { status })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
