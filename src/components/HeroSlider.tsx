import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, BarChart3, ShoppingCart, Activity } from "lucide-react";
import heroGuppy from "@/assets/hero-guppy.jpg";
import guppyCollection from "@/assets/guppy-collection.jpg";
import smartAquarium from "@/assets/smart-aquarium.jpg";

const slides = [
  {
    id: 1,
    image: heroGuppy,
    title: "Premium Guppy Fish Distribution",
    subtitle: "Your trusted partner in aquatic excellence",
    description: "Discover the finest collection of guppy fish with guaranteed quality and health standards.",
    cta: "Explore Collection",
    icon: ShoppingCart,
    background: "from-primary/20 to-accent/10"
  },
  {
    id: 2,
    image: smartAquarium,
    title: "Smart Stock Management",
    subtitle: "Advanced inventory tracking",
    description: "Real-time monitoring and automated stock management for optimal fish care and distribution.",
    cta: "Learn More",
    icon: BarChart3,
    background: "from-accent/20 to-primary/10"
  },
  {
    id: 3,
    image: guppyCollection,
    title: "Live Stock Check",
    subtitle: "Always stay updated",
    description: "Monitor fish health, water quality, and stock levels with our real-time tracking system.",
    cta: "Check Status",
    icon: Activity,
    background: "from-primary-glow/20 to-secondary/10"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/30">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.background}`}></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8 animate-fade-in-up">
                  <slide.icon className="h-16 w-16 mx-auto text-primary mb-6 animate-float" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-200">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
                    {slide.title}
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in-up delay-300">
                  {slide.subtitle}
                </p>
                
                <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-400">
                  {slide.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
                  <Button variant="ocean" size="lg" className="text-lg px-8 py-3">
                    {slide.cta}
                  </Button>
                  <Button variant="aqua" size="lg" className="text-lg px-8 py-3">
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/30 text-foreground hover:bg-background/40 transition-all duration-300 group"
      >
        <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/30 text-foreground hover:bg-background/40 transition-all duration-300 group"
      >
        <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary scale-125 shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                : "bg-background/50 hover:bg-background/70"
            }`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-accent/10 animate-float delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 rounded-full bg-primary/10 animate-float delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-primary-glow/10 animate-float delay-3000"></div>
    </div>
  );
};

export default HeroSlider;