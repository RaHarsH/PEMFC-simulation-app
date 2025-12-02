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
import { toast } from "sonner";

const otherModelsSchema = z.object({
  modelType: z.enum(["linear", "ann", "stack_model"]),
  currentMin: z.coerce.number().min(-1).max(3),
  currentMax: z.coerce.number().min(-1).max(3),
  currentSteps: z.coerce.number().min(0.01).max(1),
  temperature: z.coerce.number().min(-2).max(2),
  hydrogen: z.coerce.number().min(-2).max(3),
  oxygen: z.coerce.number().min(-3).max(3),
  RH_Cathode: z.coerce.number().min(-2).max(2),
  RH_Anode: z.coerce.number().min(-3).max(3),
});

const svrModelSchema = z.object({
  modelType: z.literal("svr"),
  currentMin: z.coerce.number().min(-1).max(3),
  currentMax: z.coerce.number().min(-1).max(3),
  currentSteps: z.coerce.number().min(0.01).max(1),
  temperature: z.coerce.number().min(-2).max(2),
  hydrogen: z.coerce.number().min(-2).max(3),
  oxygen: z.coerce.number().min(-3).max(3),
});

export const formSchema = z.discriminatedUnion("modelType", [
  otherModelsSchema,
  svrModelSchema,
]);

export function PredictionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    currents: number[];
    voltages: number[];
    powers: number[];
    modelType: string;
    temperature?: number;
    hydrogen?: number;
    oxygen?: number;
    RH_Cathode?: number;
    RH_Anode?: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelType: "linear",
      currentMin: -0.88678,
      currentMax: 2.21713,
      currentSteps: 0.1,
      temperature: -1.26144,
      hydrogen: -1.87323,
      oxygen: -1.22799,
      RH_Cathode: -1.5,
      RH_Anode: -2,
    },
  });

  function range(min: number, max: number, step: number): number[] {
    const direction = min < max ? 1 : -1;
    step = Math.abs(step);

    const length = Math.floor(Math.abs((max - min) / step)) + 1;
    const baseArray = Array.from(
      { length },
      (_, i) => min + i * step * direction
    );

    if (baseArray[baseArray.length - 1] !== max) {
      baseArray.push(max);
    }

    return baseArray;
  }

  const modelType = form.watch("modelType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const currentRange = range(
        values.currentMin,
        values.currentMax,
        values.currentSteps
      );

      const predictionData = {
        ...values,
        currents: currentRange,
      };

      console.log("DEBUG: Prediction data:", predictionData);

      const response = await axios.post("/api/predict", predictionData);

      const {
        voltages,
        powers,
        currents,
        modelType,
        temperature,
        hydrogen,
        oxygen,
        RH_Cathode,
        RH_Anode,
      } = response.data;

      toast.success("Prediction successful");

      setPredictionResult({
        voltages,
        powers,
        currents,
        modelType,
        temperature,
        hydrogen,
        oxygen,
        RH_Cathode,
        RH_Anode,
      });

      const event = new CustomEvent("prediction-updated", {
        detail: {
          currents,
          voltages,
          powers,
          modelType,
          temperature,
          hydrogen,
          oxygen,
          RH_Cathode,
          RH_Anode,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Prediction failed:", error);
      toast.error("Prediction failed");
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

      toast.success("Saved to database");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
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
                      <SelectItem value="stack_model">
                        Baseline Stack Model
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
                        min={0.001}
                        max={1}
                        step={0.01}
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
                        min={-2}
                        max={2}
                        step={0.1}
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
                    <FormLabel>Hydrogen flow rate: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={-2}
                        max={3}
                        step={0.1}
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
                    <FormLabel>Oxygen flow rate: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={-3}
                        max={3}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(modelType === "linear" ||
                modelType === "ann" ||
                modelType === "stack_model") && (
                <>
                  {/* Relative Humidity of Cathode */}
                  <FormField
                    control={form.control}
                    name="RH_Cathode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RH Cathode: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={-2}
                            max={3}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Relative Humidity of Anode */}
                  <FormField
                    control={form.control}
                    name="RH_Anode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RH Anode: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={-3}
                            max={3}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
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
