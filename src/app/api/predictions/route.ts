import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const prediction = await db.prediction.create({
      data: {
        modelType: data.modelType,
        currents: data.currents,
        voltages: data.voltages,
        powers: data.powers,
        temperature: data.temperature,
        hydrogen: data.hydrogen,
        oxygen: data.oxygen,
      },
    })

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error creating prediction:", error)
    return NextResponse.json({ error: "Failed to create prediction" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const predictions = await db.prediction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Error fetching predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
