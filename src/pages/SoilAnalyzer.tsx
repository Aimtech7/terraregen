import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image as ImageIcon, Brain, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SoilAnalyzer = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      toast.success(`${files[0].name} is ready for analysis`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      toast.success(`${files[0].name} is ready for analysis`);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please upload a soil image first");
      return;
    }

    setAnalyzing(true);
    try {
      const imageData = await convertToBase64(selectedFile);

      const { data, error } = await supabase.functions.invoke('analyze-soil', {
        body: {
          imageData,
          description: selectedFile.name
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      // Store in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('soil_analyses').insert({
          user_id: user.id,
          image_url: imageData,
          ph_level: data.analysis.ph_estimate,
          nitrogen_level: data.analysis.nitrogen_level,
          phosphorus_level: data.analysis.phosphorus_level,
          potassium_level: data.analysis.potassium_level,
          organic_matter_percent: data.analysis.organic_matter_estimate,
          analysis_result: data.analysis,
          recommendations: data.analysis.recommendations.join('\n')
        });
      }

      toast.success("Soil analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze soil");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 animate-slide-up">
          <h1 className="mb-2">AI Soil Health Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Upload soil images for instant AI-powered health assessment
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-8 animate-fade-in">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="mb-2">Drop your soil image here</h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse your files
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    <span>JPG, PNG, WebP</span>
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-6 p-4 bg-muted rounded-lg flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {analysis && (
            <Card className="p-8 animate-fade-in">
              <h3 className="mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Analysis Results
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">pH Level</p>
                    <p className="text-2xl font-bold">{analysis.ph_estimate}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                    <p className="text-2xl font-bold">{analysis.health_score}/100</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Nitrogen</p>
                    <p className="text-2xl font-bold capitalize">{analysis.nitrogen_level}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Phosphorus</p>
                    <p className="text-2xl font-bold capitalize">{analysis.phosphorus_level}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Potassium</p>
                    <p className="text-2xl font-bold capitalize">{analysis.potassium_level}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Organic Matter</p>
                    <p className="text-2xl font-bold">{analysis.organic_matter_estimate}%</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <p className="text-muted-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!analysis && (
            <Card className="p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="mb-4">What You'll Get</h3>
              <div className="space-y-4">
                {[
                  "Detailed nutrient composition breakdown (N, P, K)",
                  "Soil health score (0-100 scale)",
                  "Personalized restoration recommendations",
                  "pH and organic matter analysis",
                  "AI-powered insights based on image analysis",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilAnalyzer;