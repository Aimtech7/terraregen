import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialTools = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('financial_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setRecords(data || []);
  };

  const addRecord = async () => {
    if (!amount || !category) {
      toast.error("Please fill all required fields");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('financial_records')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        type,
        category,
        amount: parseFloat(amount),
        description
      });

    if (error) {
      toast.error("Failed to add record");
    } else {
      toast.success("Financial record added");
      setAmount("");
      setCategory("");
      setDescription("");
      fetchRecords();
    }
  };

  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const totalExpenses = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Financial Tools</h1>
          <p className="text-muted-foreground">
            Track costs and calculate ROI for your regeneration project
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Financial Record</CardTitle>
            <CardDescription>Track your regeneration project costs and income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Seeds, Labor, Carbon Credits"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={addRecord}>Add Record</Button>
          </CardContent>
        </Card>

        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{record.category}</p>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                    </div>
                    <div className={`font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'income' ? '+' : '-'}${parseFloat(record.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinancialTools;