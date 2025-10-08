import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export const DataFetcher = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchEnvironmentalData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-environmental-data');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Environmental data fetched successfully! Refresh the page to see updates.",
      });
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch environmental data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={fetchEnvironmentalData}
        disabled={loading}
        size="lg"
        className="shadow-lg"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Fetching Data...' : 'Fetch Environmental Data'}
      </Button>
    </div>
  );
};