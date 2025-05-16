"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

import { Save, Zap } from "lucide-react";
import axios from "axios";

const formSchema = z.object({
  modelType: z.string(),
  currentMin: z.coerce.number().min(0).max(100),
  currentMax: z.coerce.number().min(0).max(100),
  currentSteps: z.coerce.number().int().min(2).max(100),
  temperature: z.coerce.number().min(0).max(200),
  hydrogen: z.coerce.number().min(0).max(100),
  oxygen: z.coerce.number().min(0).max(100),
});

export function PredictionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    currents: number[];
    voltages: number[];
    powers: number[];
    modelType: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelType: "linear",
      currentMin: 0,
      currentMax: 50,
      currentSteps: 10,
      temperature: 80,
      hydrogen: 95,
      oxygen: 21,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const currentRange = Array.from(
        { length: values.currentSteps },
        (_, i) =>
          values.currentMin +
          (values.currentMax - values.currentMin) *
            (i / (values.currentSteps - 1))
      );

      const predictionData = {
        ...values,
        currents: currentRange,
      };

      const response = await axios.post("/api/predict", predictionData);

      const { voltages, powers, currents } = response.data;

      // Save to state
      setPredictionResult({
        voltages,
        powers,
        currents,
        modelType: values.modelType,
      });

      const event = new CustomEvent("prediction-updated", {
        detail: {
          currents,
          voltages,
          powers,
          modelType: values.modelType,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Prediction failed:", error);
      setPredictionResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveToDatabase() {
    if (!predictionResult) return;

    const values = form.getValues();
    setIsSubmitting(true);

    try {
      const predictionData = {
        ...values,
        currents: predictionResult.currents,
        voltages: predictionResult.voltages,
        powers: predictionResult.powers,
      };

      await axios.post("/api/predictions", predictionData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // toast.success("Saved to database")
    } catch (error) {
      console.error("Save failed:", error);
      // toast.error("Failed to save")
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Prediction Parameters</CardTitle>
        <CardDescription>
          Configure the model and input parameters for your PEMFC prediction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Model Selection */}
            <FormField
              control={form.control}
              name="modelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ML Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="linear">Linear Regression</SelectItem>
                      <SelectItem value="svr">
                        Support Vector Regression (SVR)
                      </SelectItem>
                      <SelectItem value="ann">
                        Artificial Neural Network (ANN)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the model to use for prediction.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            {/* Current Inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Current Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Current (A)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Current (A)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="currentSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steps: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={2}
                        max={50}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of current points to generate.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            {/* Operating Conditions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Operating Conditions</h3>
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C): {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={20}
                        max={120}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hydrogen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hydrogen Concentration (%): {field.value}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oxygen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Oxygen Concentration (%): {field.value}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer"
              >
                <Zap className="mr-2 h-4 w-4" />
                Run Prediction
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={saveToDatabase}
                disabled={isSubmitting || predictionResult === null}
                className="flex-1 cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                Save to Database
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
