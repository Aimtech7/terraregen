import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Cloud, Droplets, Wind, Thermometer, RefreshCw } from "lucide-react";

const WeatherForecast = () => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('weather_forecasts')
      .select('*')
      .eq('user_id', user.id)
      .gte('forecast_date', new Date().toISOString().split('T')[0])
      .order('forecast_date', { ascending: true })
      .limit(7);

    setForecast(data || []);
  };

  const refreshForecast = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('fetch-weather-forecast');

      if (error) throw error;

      toast.success("Weather forecast updated!");
      fetchForecast();
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch weather forecast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Weather Forecast</h1>
            <p className="text-muted-foreground">
              7-day weather forecast for your location
            </p>
          </div>
          <Button onClick={refreshForecast} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Forecast
          </Button>
        </div>

        {forecast.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No weather data available</p>
              <Button onClick={refreshForecast} disabled={loading}>
                {loading ? "Loading..." : "Fetch Weather Forecast"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forecast.map((day) => (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle>{new Date(day.forecast_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</CardTitle>
                  <CardDescription>{day.conditions}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-semibold">
                      {day.temperature_low?.toFixed(0)}° - {day.temperature_high?.toFixed(0)}°C
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Precipitation</span>
                    </div>
                    <span className="font-semibold">{day.precipitation_mm?.toFixed(1)} mm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <span className="font-semibold">{day.wind_speed_kmh?.toFixed(0)} km/h</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="font-semibold">{day.humidity_percent?.toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Irrigation Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {forecast.length > 0 && (
              <div className="space-y-2">
                {forecast[0].precipitation_mm < 5 && (
                  <p className="text-sm">⚠️ Low rainfall expected. Consider supplemental irrigation in the next 24 hours.</p>
                )}
                {forecast[0].precipitation_mm >= 5 && forecast[0].precipitation_mm < 15 && (
                  <p className="text-sm">✓ Moderate rainfall expected. Monitor soil moisture levels.</p>
                )}
                {forecast[0].precipitation_mm >= 15 && (
                  <p className="text-sm">✓ Good rainfall expected. Skip irrigation for the next 2-3 days.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherForecast;