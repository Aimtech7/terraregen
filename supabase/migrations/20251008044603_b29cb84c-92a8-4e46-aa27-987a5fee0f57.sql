-- Create metrics table
CREATE TABLE public.metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value text NOT NULL,
  change text NOT NULL,
  trend text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vegetation_data table
CREATE TABLE public.vegetation_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  ndvi numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  time text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vegetation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for metrics
CREATE POLICY "Users can view their own metrics"
  ON public.metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON public.metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON public.metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON public.metrics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for vegetation_data
CREATE POLICY "Users can view their own vegetation data"
  ON public.vegetation_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vegetation data"
  ON public.vegetation_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vegetation data"
  ON public.vegetation_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vegetation data"
  ON public.vegetation_data FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vegetation_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Create trigger for updated_at on metrics
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON public.metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on vegetation_data
CREATE TRIGGER update_vegetation_data_updated_at
  BEFORE UPDATE ON public.vegetation_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on alerts
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();