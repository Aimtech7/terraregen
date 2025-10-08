import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Droplets, Wind, Sun } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataFetcher } from "@/components/DataFetcher";

const Dashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [vegetationData, setVegetationData] = useState<any[]>([]);
  const [rainfallData, setRainfallData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const chartConfig = {
    ndvi: {
      label: "NDVI",
      color: "hsl(var(--primary))",
    },
    rainfall: {
      label: "Rainfall (mm)",
      color: "hsl(var(--chart-2))",
    },
  };

  const iconMap: Record<string, any> = {
    "NDVI Index": Activity,
    "Soil Moisture": Droplets,
    "Erosion Risk": Wind,
    "Carbon Capture": Sun,
  };

  const colorMap: Record<string, string> = {
    "NDVI Index": "text-green-600",
    "Soil Moisture": "text-blue-600",
    "Erosion Risk": "text-orange-600",
    "Carbon Capture": "text-purple-600",
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from("metrics")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      });
      return;
    }

    const formattedMetrics = data?.map((m) => ({
      title: m.metric_type,
      value: m.value,
      change: m.change,
      trend: m.trend,
      icon: iconMap[m.metric_type] || Activity,
      color: colorMap[m.metric_type] || "text-gray-600",
    })) || [];

    setMetrics(formattedMetrics);
  };

  // Fetch vegetation data
  const fetchVegetationData = async () => {
    const { data, error } = await supabase
      .from("vegetation_data")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching vegetation data:", error);
      return;
    }

    setVegetationData(data || []);
  };

  // Fetch rainfall data
  const fetchRainfallData = async () => {
    const { data, error } = await supabase
      .from("rainfall_data")
      .select("*")
      .order("month", { ascending: true })
      .limit(12);

    if (error) {
      console.error("Error fetching rainfall data:", error);
      return;
    }

    setRainfallData(data || []);
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching alerts:", error);
      return;
    }

    setAlerts(data || []);
  };

  useEffect(() => {
    fetchMetrics();
    fetchVegetationData();
    fetchRainfallData();
    fetchAlerts();

    // Set up real-time subscriptions
    const metricsChannel = supabase
      .channel("metrics-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "metrics",
        },
        () => fetchMetrics()
      )
      .subscribe();

    const vegetationChannel = supabase
      .channel("vegetation-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vegetation_data",
        },
        () => fetchVegetationData()
      )
      .subscribe();

    const rainfallChannel = supabase
      .channel("rainfall-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rainfall_data",
        },
        () => fetchRainfallData()
      )
      .subscribe();

    const alertsChannel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(vegetationChannel);
      supabase.removeChannel(rainfallChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="container mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="mb-2">Land Monitoring Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Real-time environmental data and regeneration insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
            
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-muted ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-1">{metric.value}</h3>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="mb-4">Vegetation Health Trend</h3>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={[0, 1]} 
                    className="text-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="ndvi" 
                    stroke="var(--color-ndvi)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-ndvi)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <h3 className="mb-4">Rainfall Pattern</h3>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tickFormatter={(value) => {
                      const date = new Date(value + '-01');
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="rainfall_mm" 
                    fill="var(--color-rainfall)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="p-6 lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <h3 className="mb-4">Recent Alerts & Insights</h3>
            {alerts.length === 0 ? (
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No alerts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "success" ? "bg-green-500" :
                      alert.type === "warning" ? "bg-orange-500" :
                      "bg-blue-500"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      <DataFetcher />
    </div>
  );
};

export default Dashboard;
