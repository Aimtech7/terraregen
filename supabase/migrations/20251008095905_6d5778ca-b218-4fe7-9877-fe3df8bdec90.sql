-- Create table for Kenyan counties and agro-ecological zones
CREATE TABLE public.kenya_counties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  agro_ecological_zone text NOT NULL,
  rainfall_pattern text NOT NULL CHECK (rainfall_pattern IN ('bimodal', 'unimodal')),
  long_rains_start text,
  long_rains_end text,
  short_rains_start text,
  short_rains_end text,
  average_rainfall_mm numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for seasonal planting calendars
CREATE TABLE public.planting_calendars (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  county_id uuid NOT NULL REFERENCES public.kenya_counties(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  crop_variety text,
  season text NOT NULL CHECK (season IN ('long_rains', 'short_rains', 'year_round')),
  planting_window_start text NOT NULL,
  planting_window_end text NOT NULL,
  harvesting_window_start text,
  harvesting_window_end text,
  recommended_soil_ph_min numeric,
  recommended_soil_ph_max numeric,
  water_requirements text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for crop-specific insights
CREATE TABLE public.crop_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  county_id uuid REFERENCES public.kenya_counties(id),
  crop_name text NOT NULL,
  soil_type text,
  climate_adaptation_notes text,
  fertilizer_recommendations jsonb,
  pest_disease_alerts jsonb,
  market_insights jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for local weather data
CREATE TABLE public.local_weather_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  county_id uuid NOT NULL REFERENCES public.kenya_counties(id) ON DELETE CASCADE,
  date date NOT NULL,
  temperature_max numeric,
  temperature_min numeric,
  precipitation_mm numeric,
  humidity_percent numeric,
  wind_speed_kmh numeric,
  source text NOT NULL DEFAULT 'open-meteo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(county_id, date, source)
);

-- Enable RLS
ALTER TABLE public.kenya_counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_weather_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for kenya_counties (public read)
CREATE POLICY "Counties are viewable by everyone"
ON public.kenya_counties FOR SELECT
USING (true);

-- RLS policies for planting_calendars (public read)
CREATE POLICY "Planting calendars are viewable by everyone"
ON public.planting_calendars FOR SELECT
USING (true);

-- RLS policies for crop_insights
CREATE POLICY "Users can view their own crop insights"
ON public.crop_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crop insights"
ON public.crop_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crop insights"
ON public.crop_insights FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crop insights"
ON public.crop_insights FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for local_weather_data (public read)
CREATE POLICY "Weather data is viewable by everyone"
ON public.local_weather_data FOR SELECT
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_kenya_counties_updated_at
BEFORE UPDATE ON public.kenya_counties
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_planting_calendars_updated_at
BEFORE UPDATE ON public.planting_calendars
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_crop_insights_updated_at
BEFORE UPDATE ON public.crop_insights
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample Kenyan county data with agro-ecological zones
INSERT INTO public.kenya_counties (name, code, agro_ecological_zone, rainfall_pattern, long_rains_start, long_rains_end, short_rains_start, short_rains_end, average_rainfall_mm) VALUES
('Nairobi', 'NRB', 'Semi-Humid to Humid', 'bimodal', 'March', 'May', 'October', 'December', 900),
('Kiambu', 'KBU', 'Humid', 'bimodal', 'March', 'May', 'October', 'December', 1200),
('Machakos', 'MCK', 'Semi-Arid', 'bimodal', 'March', 'May', 'October', 'November', 600),
('Nakuru', 'NKR', 'Semi-Humid', 'bimodal', 'March', 'May', 'October', 'December', 1000),
('Kisumu', 'KSM', 'Humid', 'bimodal', 'March', 'May', 'September', 'November', 1400),
('Meru', 'MRU', 'Humid', 'bimodal', 'March', 'May', 'October', 'December', 1500),
('Kajiado', 'KJD', 'Semi-Arid to Arid', 'bimodal', 'March', 'May', 'November', 'December', 500),
('Uasin Gishu', 'UGS', 'Semi-Humid', 'unimodal', 'April', 'September', NULL, NULL, 1100),
('Trans-Nzoia', 'TNZ', 'Humid', 'unimodal', 'April', 'October', NULL, NULL, 1200),
('Bungoma', 'BGM', 'Humid', 'unimodal', 'April', 'October', NULL, NULL, 1600),
('Turkana', 'TRK', 'Arid', 'bimodal', 'March', 'May', 'October', 'November', 300),
('Garissa', 'GRS', 'Arid', 'bimodal', 'April', 'May', 'October', 'November', 250);

-- Insert sample planting calendar data for common Kenyan crops
INSERT INTO public.planting_calendars (county_id, crop_name, crop_variety, season, planting_window_start, planting_window_end, harvesting_window_start, harvesting_window_end, recommended_soil_ph_min, recommended_soil_ph_max, water_requirements)
SELECT 
  c.id,
  'Maize',
  'H614, H629, DH04',
  'long_rains',
  'March',
  'April',
  'August',
  'September',
  5.5,
  7.0,
  'Medium - 500-800mm during growing season'
FROM public.kenya_counties c
WHERE c.rainfall_pattern = 'bimodal' AND c.average_rainfall_mm > 500;

INSERT INTO public.planting_calendars (county_id, crop_name, season, planting_window_start, planting_window_end, harvesting_window_start, harvesting_window_end, recommended_soil_ph_min, recommended_soil_ph_max, water_requirements)
SELECT 
  c.id,
  'Beans',
  'long_rains',
  'March',
  'April',
  'June',
  'July',
  6.0,
  7.5,
  'Medium - 350-500mm during growing season'
FROM public.kenya_counties c
WHERE c.rainfall_pattern = 'bimodal';

INSERT INTO public.planting_calendars (county_id, crop_name, season, planting_window_start, planting_window_end, harvesting_window_start, harvesting_window_end, recommended_soil_ph_min, recommended_soil_ph_max, water_requirements)
SELECT 
  c.id,
  'Potatoes',
  'long_rains',
  'February',
  'March',
  'June',
  'July',
  5.0,
  6.5,
  'High - 500-700mm during growing season'
FROM public.kenya_counties c
WHERE c.agro_ecological_zone IN ('Humid', 'Semi-Humid');

INSERT INTO public.planting_calendars (county_id, crop_name, season, planting_window_start, planting_window_end, harvesting_window_start, harvesting_window_end, recommended_soil_ph_min, recommended_soil_ph_max, water_requirements)
SELECT 
  c.id,
  'Sorghum',
  'long_rains',
  'March',
  'April',
  'August',
  'September',
  5.5,
  7.5,
  'Low - 300-450mm during growing season'
FROM public.kenya_counties c
WHERE c.agro_ecological_zone IN ('Semi-Arid', 'Arid');