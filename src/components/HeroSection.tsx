import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Database, Upload, Brain } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const HeroSection = () => {
  const features = [
    {
      icon: Users,
      title: "Customer Segmentation",
      description: "Automatically categorize customers based on behavior, demographics, and purchase patterns"
    },
    {
      icon: TrendingUp,
      title: "RFM Analysis",
      description: "Recency, Frequency, Monetary analysis to identify your most valuable customers"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get actionable recommendations to improve customer retention and growth"
    }
  ];

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-glow rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">SegmentSavvy</span>
          </div>
          <Button variant="accent" size="lg">
            Get Started
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-primary-foreground mb-8 leading-tight">
            Unlock Customer
            <span className="bg-gradient-accent bg-clip-text text-transparent block">
              Insights
            </span>
            from Your Data
          </h1>
          
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your raw CSV data into actionable customer segments. Get powerful insights with advanced analytics, 
            RFM analysis, and AI-powered recommendations to grow your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={scrollToUpload}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Your Data
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
              <Database className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent rounded-2xl"></div>
            <img 
              src={heroImage} 
              alt="Customer Analytics Dashboard Preview" 
              className="w-full rounded-2xl shadow-elegant transform hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-white/10 backdrop-blur-sm border-white/20 shadow-card-shadow hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              <feature.icon className="h-12 w-12 text-accent mb-6" />
              <h3 className="text-xl font-semibold text-primary-foreground mb-4">{feature.title}</h3>
              <p className="text-primary-foreground/70 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;