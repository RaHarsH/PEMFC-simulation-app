"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react'

type PredictionPageProps = {
    params: {
        predictionId: string;
    }
}

interface PredictionData {
    id: string;
    modelType: string;
    createdAt: Date;
    temperature: number;
    hydrogen: number;
    oxygen: number;
    currents: number[];
    voltages: number[];
    powers: number[];
}

const page = ({params}: PredictionPageProps) => {

    const [ data, setData ] = useState<PredictionData>({
        id: "",
        modelType: "",
        createdAt: new Date(),
        temperature: 0,
        hydrogen: 0,
        oxygen: 0,
        currents: [],
        voltages: [],
        powers: []
    });

    const { predictionId } = params;

    const fetchPredictionById = async (predictionId: string) => {
        try {
            const response = await axios.get(`/api/predictions/${params.predictionId}`);
            const data = response.data;
            console.log("🟢 Fetched prediction successfully:", data);

            setData(data);
            
        } catch (error) {
            console.log("Failed to fetch prediction:", error);
        }
    }

    useEffect(() => {
        fetchPredictionById(predictionId);
    }, [])

  return (
    <div className="flex w-full flex-col gap-4 p-6 h-screen">
      <div className='justify-center items-center w-1/2 min-h-[200px] border border-gray-300 rounded-lg p-4'>

        Model used: {data.modelType}
        Temperature: {data.temperature}
        Hydrogen: {data.hydrogen}
        Oxygen: {data.oxygen}

      </div>
    </div>
  )
}

export default page
