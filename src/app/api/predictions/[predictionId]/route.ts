import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { predictionId: string } }) {
    try {
        const { predictionId } = params;
        if(!predictionId) {
            return new Response("Prediction ID is required", { status: 400 });
        }

        const prediction = await db.prediction.findUnique({
            where: {
                id: predictionId
            }
        })

        if(!prediction) {
            return new Response("Prediction not found", { status: 404 });
        }

        console.log("🟢 Fetched prediction successfully:", prediction);

        return new Response(JSON.stringify(prediction), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        return new Response("Failed to fetch prediction", {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
