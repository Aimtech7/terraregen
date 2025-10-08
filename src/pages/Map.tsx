import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Satellite, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLayer, setSelectedLayer] = useState("satellite");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const layers = [
    { id: "satellite", name: "Satellite View", color: "bg-blue-500", style: "mapbox://styles/mapbox/satellite-streets-v12" },
    { id: "vegetation", name: "Vegetation Index (NDVI)", color: "bg-green-500", style: "mapbox://styles/mapbox/satellite-v9" },
    { id: "terrain", name: "Terrain", color: "bg-amber-500", style: "mapbox://styles/mapbox/outdoors-v12" },
  ];

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        if (!data?.token) throw new Error('No token received');

        mapboxgl.accessToken = data.token;

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: layers.find(l => l.id === selectedLayer)?.style || "mapbox://styles/mapbox/satellite-streets-v12",
          center: [36.8219, -1.2921], // Kenya coordinates (example degraded land area)
          zoom: 6,
          pitch: 0,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add scale control
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        map.current.on('load', () => {
          setMapLoaded(true);
          setIsLoading(false);
          
          // Add sample degraded area marker
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat([36.8219, -1.2921])
            .setPopup(new mapboxgl.Popup().setHTML('<strong>Sample Degraded Area</strong><br/>NDVI: 0.23 (Low Vegetation)'))
            .addTo(map.current!);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Failed to load map. Please check your Mapbox token.');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style when layer changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      const selectedStyle = layers.find(l => l.id === selectedLayer)?.style;
      if (selectedStyle) {
        map.current.setStyle(selectedStyle);
      }
    }
  }, [selectedLayer, mapLoaded]);

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="container mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="mb-2">Interactive Land Map</h1>
          <p className="text-muted-foreground text-lg">
            Satellite-powered visualization of land health and restoration zones
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-6 lg:col-span-1 h-fit animate-fade-in">
            <h3 className="mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {layers.map((layer) => (
                <Button
                  key={layer.id}
                  variant={selectedLayer === layer.id ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedLayer(layer.id)}
                  disabled={isLoading}
                >
                  <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                  {layer.name}
                </Button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Satellite className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Live Satellite Data</p>
                  <p className="text-xs text-muted-foreground">
                    Interactive mapping with real-time environmental monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">NDVI Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Click markers to view vegetation health scores and degradation risk
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Map Area */}
          <Card className="p-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="relative h-[600px] rounded-lg overflow-hidden">
              <div ref={mapContainer} className="absolute inset-0" />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading satellite data...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;
