import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, CloudRain, Sprout, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface County {
  id: string;
  name: string;
  agro_ecological_zone: string;
  rainfall_pattern: string;
  long_rains_start: string;
  long_rains_end: string;
  short_rains_start: string;
  short_rains_end: string;
  average_rainfall_mm: number;
}

interface PlantingCalendar {
  crop_name: string;
  crop_variety: string;
  season: string;
  planting_window_start: string;
  planting_window_end: string;
  harvesting_window_start: string;
  harvesting_window_end: string;
  water_requirements: string;
}

interface CropInsight {
  climate_adaptation_notes: string;
  fertilizer_recommendations: {
    npkRatio: string;
    applicationTiming: string;
    organicAlternatives: string;
  };
  pest_disease_alerts: {
    commonPests: string[];
    commonDiseases: string[];
    preventiveMeasures: string[];
  };
  market_insights: {
    bestSellingPeriods: string;
    storageAdvice: string;
    valueAdditionTips: string;
  };
}

const KenyanInsights = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [countyData, setCountyData] = useState<any>(null);
  const [plantingCalendar, setPlantingCalendar] = useState<PlantingCalendar[]>([]);
  const [cropInsights, setCropInsights] = useState<CropInsight | null>(null);
  const [cropName, setCropName] = useState("");
  const [soilType, setSoilType] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    const { data, error } = await supabase
      .from('kenya_counties')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching counties:', error);
      return;
    }

    setCounties(data || []);
  };

  const fetchKenyanData = async () => {
    if (!selectedCounty) {
      toast({
        title: "Please select a county",
        description: "Choose a Kenyan county to get localized insights.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-kenya-data');
      
      if (error) throw error;
      
      setCountyData(data.county);
      setPlantingCalendar(data.plantingCalendar || []);
      
      toast({
        title: "Success",
        description: `Fetched data for ${data.county.name} County`,
      });
    } catch (error) {
      console.error('Error fetching Kenyan data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Kenyan agricultural data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCropInsights = async () => {
    if (!cropName || !selectedCounty) {
      toast({
        title: "Missing information",
        description: "Please select a county and enter a crop name.",
        variant: "destructive",
      });
      return;
    }

    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-crop-insights', {
        body: { cropName, soilType, countyId: selectedCounty }
      });
      
      if (error) throw error;
      
      setCropInsights({
        climate_adaptation_notes: data.insights.climate_adaptation_notes,
        fertilizer_recommendations: data.insights.fertilizer_recommendations,
        pest_disease_alerts: data.insights.pest_disease_alerts,
        market_insights: data.insights.market_insights
      });
      
      toast({
        title: "Success",
        description: `Generated insights for ${cropName}`,
      });
    } catch (error) {
      console.error('Error generating crop insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate crop insights.",
        variant: "destructive",
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Kenya Agricultural Insights
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get region-specific agricultural insights tailored for Kenyan counties, agro-ecological zones, and local growing conditions.
          </p>
        </div>

        {/* County Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Your County
            </CardTitle>
            <CardDescription>
              Choose your county to get localized planting calendars and weather data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>County</Label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county.id} value={county.id}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchKenyanData} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CloudRain className="mr-2 h-4 w-4" />
                      Fetch County Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* County Information */}
        {countyData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agro-Ecological Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{countyData.agroEcologicalZone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rainfall Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary capitalize">{countyData.rainfallPattern}</p>
                <p className="text-sm text-muted-foreground mt-2">Current: {countyData.currentSeason}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Rainfall</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{countyData.averageRainfall}mm</p>
                <p className="text-sm text-muted-foreground mt-2">Annual average</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rainfall Seasons */}
        {countyData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Rainfall Seasons
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {countyData.longRains && (
                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Long Rains</h3>
                  <p className="text-sm text-muted-foreground">{countyData.longRains}</p>
                </div>
              )}
              {countyData.shortRains && (
                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Short Rains</h3>
                  <p className="text-sm text-muted-foreground">{countyData.shortRains}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Planting Calendar */}
        {plantingCalendar.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Seasonal Planting Calendar
              </CardTitle>
              <CardDescription>
                Crop-specific planting and harvesting windows for your county
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {plantingCalendar.map((calendar, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{calendar.crop_name}</h3>
                        {calendar.crop_variety && (
                          <p className="text-sm text-muted-foreground">Varieties: {calendar.crop_variety}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {calendar.season.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Planting:</span>
                        <span className="font-medium">{calendar.planting_window_start} - {calendar.planting_window_end}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harvesting:</span>
                        <span className="font-medium">{calendar.harvesting_window_start} - {calendar.harvesting_window_end}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Water Needs:</span>
                        <span className="font-medium">{calendar.water_requirements}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crop-Specific Insights Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Generate Crop Insights
            </CardTitle>
            <CardDescription>
              Get AI-powered insights for specific crops adapted to Kenyan conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Crop Name</Label>
                <Input
                  placeholder="e.g., Maize, Beans, Potatoes"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                />
              </div>
              <div>
                <Label>Soil Type (Optional)</Label>
                <Input
                  placeholder="e.g., Clay, Sandy loam"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={generateCropInsights} disabled={insightsLoading} className="w-full">
                  {insightsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Insights'
                  )}
                </Button>
              </div>
            </div>

            {cropInsights && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Climate Adaptation</h3>
                  <p className="text-sm">{cropInsights.climate_adaptation_notes}</p>
                </div>

                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Fertilizer Recommendations</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">NPK Ratio:</span> {cropInsights.fertilizer_recommendations.npkRatio}</p>
                    <p><span className="font-medium">Timing:</span> {cropInsights.fertilizer_recommendations.applicationTiming}</p>
                    <p><span className="font-medium">Organic Options:</span> {cropInsights.fertilizer_recommendations.organicAlternatives}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Pest & Disease Alerts</h3>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Common Pests:</span>
                      <ul className="list-disc list-inside ml-2">
                        {cropInsights.pest_disease_alerts.commonPests.map((pest, i) => (
                          <li key={i}>{pest}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Common Diseases:</span>
                      <ul className="list-disc list-inside ml-2">
                        {cropInsights.pest_disease_alerts.commonDiseases.map((disease, i) => (
                          <li key={i}>{disease}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Prevention:</span>
                      <ul className="list-disc list-inside ml-2">
                        {cropInsights.pest_disease_alerts.preventiveMeasures.map((measure, i) => (
                          <li key={i}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Market Insights</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Best Selling Periods:</span> {cropInsights.market_insights.bestSellingPeriods}</p>
                    <p><span className="font-medium">Storage:</span> {cropInsights.market_insights.storageAdvice}</p>
                    <p><span className="font-medium">Value Addition:</span> {cropInsights.market_insights.valueAdditionTips}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">About This Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              This page integrates region-specific agricultural data for Kenya, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>County-level agro-ecological zone classification</li>
              <li>Bimodal and unimodal rainfall pattern tracking</li>
              <li>Seasonal planting calendars adapted to local conditions</li>
              <li>Real-time weather data from Open-Meteo</li>
              <li>AI-powered crop insights for African soils and climate</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Data sources: Open-Meteo API, Kenya Agricultural Observatory Platform (KAOP), and local agricultural research.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KenyanInsights;
