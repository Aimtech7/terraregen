-- Add unique constraints for upsert operations
ALTER TABLE public.rainfall_data ADD CONSTRAINT rainfall_data_user_month_key UNIQUE (user_id, month);
ALTER TABLE public.vegetation_data ADD CONSTRAINT vegetation_data_user_month_key UNIQUE (user_id, month);
ALTER TABLE public.metrics ADD CONSTRAINT metrics_user_type_key UNIQUE (user_id, metric_type);

-- Insert sample rainfall data for Nairobi (last 6 months)
INSERT INTO public.rainfall_data (user_id, month, rainfall_mm) VALUES
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-04', 250.5),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-05', 180.2),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-06', 95.8),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-07', 45.3),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-08', 30.1),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-09', 85.4)
ON CONFLICT (user_id, month) DO UPDATE 
SET rainfall_mm = EXCLUDED.rainfall_mm, updated_at = now();

-- Insert sample vegetation data for Nairobi (last 6 months)
INSERT INTO public.vegetation_data (user_id, month, ndvi) VALUES
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-04', 0.65),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-05', 0.58),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-06', 0.52),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-07', 0.48),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-08', 0.45),
('ec3ac111-27fe-442a-96f1-14417c41827e', '2025-09', 0.51)
ON CONFLICT (user_id, month) DO UPDATE 
SET ndvi = EXCLUDED.ndvi, updated_at = now();

-- Insert sample metrics for Nairobi
INSERT INTO public.metrics (user_id, metric_type, value, change, trend) VALUES
('ec3ac111-27fe-442a-96f1-14417c41827e', 'NDVI Index', '0.52', '+5.2%', 'up'),
('ec3ac111-27fe-442a-96f1-14417c41827e', 'Soil Moisture', '68%', '+12%', 'up'),
('ec3ac111-27fe-442a-96f1-14417c41827e', 'Erosion Risk', 'Low', '-15%', 'down'),
('ec3ac111-27fe-442a-96f1-14417c41827e', 'Carbon Capture', '3.2t/ha', '+8%', 'up')
ON CONFLICT (user_id, metric_type) DO UPDATE 
SET value = EXCLUDED.value, change = EXCLUDED.change, trend = EXCLUDED.trend, updated_at = now();

-- Insert sample alerts
INSERT INTO public.alerts (user_id, type, message, time) VALUES
('ec3ac111-27fe-442a-96f1-14417c41827e', 'success', 'Vegetation health improving in monitored area', '2 hours ago'),
('ec3ac111-27fe-442a-96f1-14417c41827e', 'warning', 'Low rainfall predicted for next week', '5 hours ago'),
('ec3ac111-27fe-442a-96f1-14417c41827e', 'info', 'Monthly environmental report available', '1 day ago');