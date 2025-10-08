import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, TrendingUp, DollarSign, FileCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CarbonTracker = () => {
  const [credits, setCredits] = useState<any[]>([]);
  const [areaHectares, setAreaHectares] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCarbonCredits();
  }, []);

  const fetchCarbonCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('carbon_credits')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setCredits(data || []);
  };

  const calculateCarbon = async () => {
    if (!areaHectares) {
      toast.error("Please enter land area");
      return;
    }

    setLoading(true);
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { error } = await supabase.functions.invoke('calculate-carbon', {
        body: {
          areaHectares: parseFloat(areaHectares),
          landType: 'regenerative',
          startDate: sixMonthsAgo.toISOString(),
          endDate: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast.success("Carbon credits calculated successfully!");
      fetchCarbonCredits();
    } catch (error: any) {
      toast.error(error.message || "Failed to calculate carbon credits");
    } finally {
      setLoading(false);
    }
  };

  const totalCarbon = credits.reduce((sum, c) => sum + parseFloat(c.carbon_sequestered_tons || 0), 0);
  const totalValue = credits.reduce((sum, c) => sum + parseFloat(c.credit_value_usd || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Carbon Credit Tracker</h1>
          <p className="text-muted-foreground">
            Track your carbon sequestration and generate credits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Carbon Sequestered</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCarbon.toFixed(2)} tons</div>
              <p className="text-xs text-muted-foreground">CO2 equivalent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Credit Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Market value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified Credits</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits.filter(c => c.status === 'verified').length}</div>
              <p className="text-xs text-muted-foreground">Out of {credits.length} total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calculate New Carbon Credits</CardTitle>
            <CardDescription>
              Calculate carbon sequestration based on your land area and vegetation improvements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">Land Area (hectares)</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                placeholder="Enter area in hectares"
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
              />
            </div>
            <Button onClick={calculateCarbon} disabled={loading}>
              {loading ? "Calculating..." : "Calculate Carbon Credits"}
            </Button>
          </CardContent>
        </Card>

        {credits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Carbon Sequestration History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={credits.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="carbon_sequestered_tons"
                    stroke="hsl(var(--primary))"
                    name="Carbon (tons)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CarbonTracker;