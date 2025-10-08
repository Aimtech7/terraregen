-- Create rainfall_data table
CREATE TABLE public.rainfall_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT NOT NULL,
  rainfall_mm NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rainfall_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own rainfall data" 
ON public.rainfall_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rainfall data" 
ON public.rainfall_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rainfall data" 
ON public.rainfall_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rainfall data" 
ON public.rainfall_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rainfall_data_updated_at
BEFORE UPDATE ON public.rainfall_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;