"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebar } from "@/components/sidebar-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Zap, ChevronRight, BarChart } from "lucide-react";
import { formatDistanceToNow, set } from "date-fns";
import axios from "axios";

type Prediction = {
  id: string;
  modelType: string;
  createdAt: Date;
};

export function Sidebar() {
  const { isOpen } = useSidebar();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/predictions");

        const data = response.data;

        console.log("🟢 Fetched predictions successfully:", data);
        setPredictions(data);
        setLoading(false);

      } catch (error) {
        console.error("Failed to fetch predictions:", error);
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span>PEMFC Predictor</span>
        </Link>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <Button className="w-full justify-start gap-2">
          <PlusCircle className="h-4 w-4" />
          New Prediction
        </Button>
      </div>
      <div className="px-6 py-2">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Recent Predictions
        </h3>
      </div>
      <ScrollArea className="flex-1 px-3">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md p-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="space-y-1 p-3">No predictions found</div>
        ) : (
          <div className="space-y-1 p-3">
            {predictions.map((prediction) => (
              <Link
                key={prediction.id}
                href={`/predictions/${prediction.id}`}
                className="flex items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
              >
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm">{prediction.modelType} Model</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(prediction.createdAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
