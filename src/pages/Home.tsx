import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, TrendingUp, Sprout, Satellite } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-regeneration.jpg";
import soilIcon from "@/assets/soil-icon.png";
import monitoringIcon from "@/assets/monitoring-icon.png";
import reforestationIcon from "@/assets/reforestation-icon.png";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = [
    {
      title: "AI Soil Health Analysis",
      description: "Upload soil data and get instant AI-powered insights on nutrient content, organic matter, and restoration recommendations.",
      icon: soilIcon,
      link: "/soil-analyzer",
    },
    {
      title: "Real-time Land Monitoring",
      description: "Track vegetation indices, rainfall patterns, and erosion risks using satellite data and environmental sensors.",
      icon: monitoringIcon,
      link: "/dashboard",
    },
    {
      title: "Reforestation Planning",
      description: "AI-driven restoration plans with native species recommendations and planting zone identification.",
      icon: reforestationIcon,
      link: "/map",
    },
  ];

  const stats = [
    { value: "50K+", label: "Hectares Monitored", icon: TrendingUp },
    { value: "15M+", label: "Trees Recommended", icon: Sprout },
    { value: "24/7", label: "Satellite Coverage", icon: Satellite },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="mb-6 leading-tight">
                Heal the Land with{" "}
                <span className="text-gradient">AI-Powered Insights</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Monitor degraded ecosystems, get AI-driven restoration plans, and join a global community committed to regenerating our planet's vital lands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto gap-2 group"
                  onClick={() => navigate(user ? "/soil-analyzer" : "/auth")}
                >
                  {user ? "Start Analyzing" : "Get Started"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => navigate(user ? "/dashboard" : "/map")}
                >
                  {user ? "View Dashboard" : "Explore Map"}
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Land transformation from degraded to regenerated"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-border bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="mb-4">Powerful Tools for Land Regeneration</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI and satellite technology to restore degraded ecosystems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <h3 className="mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link to={feature.link}>
                  <Button variant="ghost" className="gap-2 group p-0 h-auto">
                    Learn more
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 gradient-hero text-white text-center">
            <h2 className="mb-4 text-white">Ready to Start Regenerating?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of farmers, researchers, and environmental advocates using AI to restore our planet
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2 group"
              onClick={() => navigate(user ? "/soil-analyzer" : "/auth")}
            >
              {user ? "Start Analyzing" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
