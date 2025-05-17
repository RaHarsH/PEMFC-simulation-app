"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Search,
  Zap,
  Info,
  BarChart,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input"

export function DocumentationDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <BookOpen className="h-4 w-4" />
        <span>Docs</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              PEMFC Prediction Documentation
            </DialogTitle>
            <DialogDescription>
              Learn about PEMFC fuel cells and how to use this prediction tool
            </DialogDescription>

            {/* Not needed for now */}

            {/* <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
          </DialogHeader>
          <Tabs defaultValue="overview" className="px-6 pb-6">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex gap-2">
                <Info className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex gap-2">
                <BarChart className="h-4 w-4" />
                Usage
              </TabsTrigger>
              <TabsTrigger value="limitations" className="flex gap-2">
                <AlertTriangle className="h-4 w-4" />
                Limitations
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] pr-4">
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">
                          What are PEMFC Fuel Cells?
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Proton Exchange Membrane Fuel Cells (PEMFCs) are
                        electrochemical devices that convert the chemical energy
                        of hydrogen into electrical energy, with water and heat
                        as the only byproducts.
                      </p>

                      <div className="bg-card border rounded-md p-4 mb-4">
                        <h4 className="font-medium mb-2">Key Features</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>
                            Clean energy production with zero harmful emissions
                          </li>
                          <li>High energy conversion efficiency (40-60%)</li>
                          <li>Low operating temperatures (50-100°C)</li>
                          <li>Quick start-up and response to load changes</li>
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <BarChart className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-medium">
                          PEMFC Stack Configuration
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        In this project, we're working with a stack of
                        approximately <strong>400 individual cells</strong>.
                        Each cell is capable of producing:
                      </p>
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary"
                          >
                            Maximum Voltage
                          </Badge>
                          <span>Up to 1.25 volts per cell</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary"
                          >
                            Total Stack Voltage
                          </Badge>
                          <span>Up to 500 volts (theoretical maximum)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary"
                          >
                            Practical Voltage
                          </Badge>
                          <span>
                            0.6-0.7 volts per cell under typical operating
                            conditions
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground">
                        The cells are connected in series to increase voltage
                        and in parallel to increase current capacity, allowing
                        for scalable power output based on application
                        requirements.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-lg font-medium">
                          How This Tool Helps
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        This prediction tool allows engineers and researchers to
                        model the performance of PEMFC stacks under various
                        operating conditions without the need for physical
                        testing, saving time and resources during the
                        development process.
                      </p>

                      <div className="bg-card border rounded-md p-4">
                        <h4 className="font-medium mb-2">
                          Prediction Capabilities
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>
                            Voltage-current characteristics across operating
                            ranges
                          </li>
                          <li>Power output optimization</li>
                          <li>
                            Performance under varying temperature conditions
                          </li>
                          <li>Effects of gas flow rates (H₂ and O₂)</li>
                          <li>Identification of optimal operating points</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-3">
                        Using the Prediction Tool
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Step 1: Select a Model
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            Choose from three machine learning models, each with
                            different characteristics:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                              <strong>Linear Regression:</strong> Fast but less
                              accurate for non-linear regions
                            </li>
                            <li>
                              <strong>Support Vector Regression (SVR):</strong>{" "}
                              Better for capturing non-linearities
                            </li>
                            <li>
                              <strong>Artificial Neural Network (ANN):</strong>{" "}
                              Most accurate but computationally intensive
                            </li>
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">
                            Step 2: Configure Current Range
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            Set the minimum and maximum current values and the
                            number of data points to generate within that range.
                          </p>
                          <div className="bg-card border rounded-md p-3 text-sm">
                            <p>
                              <strong>Tip:</strong> For more detailed curves,
                              increase the number of steps.
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">
                            Step 3: Set Operating Conditions
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            Adjust the sliders to set:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary"
                              >
                                <strong>Temperature:</strong>
                              </Badge>
                              -2 to 2°C (recommended: -1.26144 - 1.45879°C)
                            </li>
                            <li>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary"
                              >
                                <strong>Hydrogen Flow Rate:</strong>
                              </Badge>{" "}
                              -2 to 3 (recommended: &gt;=-1.87323 &
                              &lt;=2.33931)
                            </li>
                            <li>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary"
                              >
                                <strong>Oxygen Flow Rate:</strong>
                              </Badge>{" "}
                              -3 to 3 (recommended: &gt;=-1.22799 &
                              &lt;=2.04881)
                            </li>
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">
                            Step 4: Run Prediction & Save Results
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            Click "Run Prediction" to generate the voltage and
                            power curves. If you want to save the results for
                            future reference, click "Save to Database".
                          </p>
                          <p className="text-muted-foreground">
                            Saved predictions will appear in the sidebar and can
                            be accessed later for comparison or further
                            analysis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="limitations" className="mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-lg font-medium">
                          Model Limitations
                        </h3>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        The prediction models have certain limitations due to
                        the constraints of the training data and simplifications
                        in the modeling approach:
                      </p>

                      <div className="space-y-4">
                        <div className="bg-card border rounded-md p-4">
                          <h4 className="font-medium mb-2">
                            Data Range Constraints
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            The models are trained on a specific range of
                            operating conditions:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                              <strong>Current:</strong> -1-3 A (most accurate
                              between -0.88678-2.21713 A)
                            </li>
                            <li>
                              <strong>Temperature:</strong> -2 to 2°C (most
                              accurate between -1.26144 - 1.45879°C)
                            </li>
                            <li>
                              <strong>Hydrogen flow rate:</strong> -2 to 3 (recommended: &gt;=-1.87323 &
                              &lt;=2.33931)
                            </li>
                            <li>
                              <strong>Oxygen flow rate:</strong> -3 to 3 (recommended: &gt;=-1.22799 &
                              &lt;=2.04881)
                            </li>
                          </ul>
                          <p className="text-sm mt-2 text-yellow-500">
                            Predictions outside these ranges may be less
                            accurate and should be used with caution.
                          </p>
                        </div>

                        <div className="bg-card border rounded-md p-4">
                          <h4 className="font-medium mb-2">
                            Model Simplifications
                          </h4>
                          <p className="text-muted-foreground mb-2">
                            The current models do not account for:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Degradation effects over time</li>
                            <li>Transient behavior during load changes</li>
                            <li>Humidity effects on membrane conductivity</li>
                            <li>
                              Pressure variations beyond atmospheric pressure
                            </li>
                            <li>Contaminant effects on catalyst performance</li>
                          </ul>
                        </div>

                        {/* <div className="bg-card border rounded-md p-4">
                          <h4 className="font-medium mb-2">
                            Accuracy Considerations
                          </h4>
                          <p className="text-muted-foreground">
                            The models have been validated against experimental
                            data with the following typical error ranges:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                              <strong>Linear Regression:</strong> ±5-10% error
                            </li>
                            <li>
                              <strong>SVR:</strong> ±3-7% error
                            </li>
                            <li>
                              <strong>ANN:</strong> ±2-5% error
                            </li>
                          </ul>
                          <p className="text-sm mt-2">
                            Error tends to increase at extreme current values
                            (very low or very high) and at operating conditions
                            near the boundaries of the training data.
                          </p>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex items-center justify-between p-4 border-t bg-muted/40">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">Ctrl</span> K
              </kbd>
              <span>to open documentation</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
