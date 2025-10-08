-- Carbon Credits Tracking Table
CREATE TABLE public.carbon_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  carbon_sequestered_tons NUMERIC(10,2) NOT NULL,
  area_hectares NUMERIC(10,2) NOT NULL,
  credit_value_usd NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own carbon credits"
ON public.carbon_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carbon credits"
ON public.carbon_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carbon credits"
ON public.carbon_credits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own carbon credits"
ON public.carbon_credits FOR DELETE
USING (auth.uid() = user_id);

-- Soil Analyses Table
CREATE TABLE public.soil_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT,
  ph_level NUMERIC(3,1),
  nitrogen_level TEXT,
  phosphorus_level TEXT,
  potassium_level TEXT,
  organic_matter_percent NUMERIC(5,2),
  analysis_result JSONB,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.soil_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own soil analyses"
ON public.soil_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own soil analyses"
ON public.soil_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own soil analyses"
ON public.soil_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own soil analyses"
ON public.soil_analyses FOR DELETE
USING (auth.uid() = user_id);

-- Team Members Table (for collaboration)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  land_owner_id UUID NOT NULL,
  member_email TEXT NOT NULL,
  member_user_id UUID,
  role TEXT NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{"view": true, "edit": false, "delete": false}'::jsonb,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(land_owner_id, member_email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Land owners can manage their team"
ON public.team_members FOR ALL
USING (auth.uid() = land_owner_id);

CREATE POLICY "Members can view teams they belong to"
ON public.team_members FOR SELECT
USING (auth.uid() = member_user_id OR auth.uid() = land_owner_id);

-- Land Polygons Table (for map drawing)
CREATE TABLE public.land_polygons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  polygon_data JSONB NOT NULL,
  area_hectares NUMERIC(10,2),
  color TEXT DEFAULT '#10b981',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.land_polygons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own polygons"
ON public.land_polygons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own polygons"
ON public.land_polygons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polygons"
ON public.land_polygons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polygons"
ON public.land_polygons FOR DELETE
USING (auth.uid() = user_id);

-- Weather Forecasts Table
CREATE TABLE public.weather_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  temperature_high NUMERIC(5,2),
  temperature_low NUMERIC(5,2),
  precipitation_mm NUMERIC(6,2),
  humidity_percent NUMERIC(5,2),
  wind_speed_kmh NUMERIC(5,2),
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, forecast_date)
);

ALTER TABLE public.weather_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own forecasts"
ON public.weather_forecasts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forecasts"
ON public.weather_forecasts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Financial Records Table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own financial records"
ON public.financial_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial records"
ON public.financial_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial records"
ON public.financial_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial records"
ON public.financial_records FOR DELETE
USING (auth.uid() = user_id);

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Comments Table (for collaboration)
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_to_type TEXT NOT NULL,
  related_to_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their data"
ON public.comments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_carbon_credits_updated_at
BEFORE UPDATE ON public.carbon_credits
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_soil_analyses_updated_at
BEFORE UPDATE ON public.soil_analyses
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_land_polygons_updated_at
BEFORE UPDATE ON public.land_polygons
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_financial_records_updated_at
BEFORE UPDATE ON public.financial_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();