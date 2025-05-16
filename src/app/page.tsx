import { MainLayout } from "@/components/main-layout"
import { PredictionForm } from "@/components/prediction-form"
import { PredictionResults } from "@/components/pediction-results"

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 p-6 w-full">
        <div className="w-full lg:w-1/2">
          <PredictionForm />
        </div>
        <div className="w-full lg:w-1/2">
          <PredictionResults />
        </div>
      </div>
    </MainLayout>
  )
}
