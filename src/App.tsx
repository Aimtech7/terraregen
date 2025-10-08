import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SoilAnalyzer from "./pages/SoilAnalyzer";
import Map from "./pages/Map";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import CarbonTracker from "./pages/CarbonTracker";
import WeatherForecast from "./pages/WeatherForecast";
import FinancialTools from "./pages/FinancialTools";
import TeamCollaboration from "./pages/TeamCollaboration";
import About from "./pages/About";
import KenyanInsights from "./pages/KenyanInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/soil-analyzer" element={<ProtectedRoute><SoilAnalyzer /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/carbon-tracker" element={<ProtectedRoute><CarbonTracker /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherForecast /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><FinancialTools /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamCollaboration /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/kenya-insights" element={<ProtectedRoute><KenyanInsights /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
