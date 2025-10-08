import { ExternalLink, Leaf, Target, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            About TerraRegen
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering sustainable land management through AI and data-driven insights
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                TerraRegen is dedicated to revolutionizing land regeneration and sustainable agriculture 
                through cutting-edge technology. We combine AI-powered analysis, real-time environmental 
                monitoring, and collaborative tools to help landowners, farmers, and environmental 
                organizations make data-driven decisions for a healthier planet.
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• AI-powered soil analysis and health monitoring</li>
                <li>• Carbon sequestration tracking and credit management</li>
                <li>• Real-time weather forecasting and environmental data</li>
                <li>• Interactive mapping and land visualization tools</li>
                <li>• Financial tools for sustainable agriculture planning</li>
                <li>• Team collaboration and project management features</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                About the Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                TerraRegen was designed and developed with a passion for combining technology 
                and environmental sustainability. Learn more about the creator's work and portfolio.
              </p>
              <a 
                href="https://ui-ux-austine-portfolio.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="gap-2">
                  View Creator's Portfolio
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 TerraRegen. Building a sustainable future, one hectare at a time.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
