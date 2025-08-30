import { Check, Users, Award, Shield } from "lucide-react";
import { Button } from "./ui/button";

const features = [
  {
    icon: Users,
    title: "Expert Team",
    description: "Professional aquaculturists with decades of experience in guppy breeding and distribution."
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Only the finest, healthiest guppy fish with guaranteed genetic diversity and vibrant colors."
  },
  {
    icon: Shield,
    title: "Health Guarantee",
    description: "100% health guarantee with comprehensive care instructions and ongoing support."
  }
];

const stats = [
  { number: "10,000+", label: "Happy Customers" },
  { number: "50+", label: "Fish Varieties" },
  { number: "99.9%", label: "Survival Rate" },
  { number: "24/7", label: "Support" }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-black bg-clip-text text-transparent">
                About AquaFlow
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leading the aquatic industry with innovative technology and passionate expertise in guppy fish distribution.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <div className="space-y-6 animate-slide-in-left">
              <h3 className="text-3xl font-bold text-foreground">
                Revolutionizing Fish Distribution
              </h3>
              <p className="text-lg text-muted-foreground">
                At AquaFlow, we combine traditional aquaculture expertise with cutting-edge technology to deliver the finest guppy fish to enthusiasts worldwide. Our advanced monitoring systems ensure optimal health and quality at every stage of the distribution process.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Real-time Health Monitoring</h4>
                    <p className="text-muted-foreground">Advanced sensors track water quality and fish behavior 24/7.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Automated Stock Management</h4>
                    <p className="text-muted-foreground">Smart inventory systems optimize breeding and distribution schedules.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Quality Assurance</h4>
                    <p className="text-muted-foreground">Rigorous testing and certification processes ensure premium quality.</p>
                  </div>
                </div>
              </div>

              <a href="#contact">
                <Button variant="ocean" size="lg" className="mt-6">
                  Learn More About Our Process
                </Button>
              </a>
            </div>

            {/* Right Content - Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start space-x-4 p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;