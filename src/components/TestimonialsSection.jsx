import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight, User } from "lucide-react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/testimonials`);
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Set some mock testimonials if API fails
      setTestimonials([
        {
          _id: '1',
          name: 'Sarah Johnson',
          feedback: 'Amazing guppy fish! The quality is outstanding and the delivery was super fast. My aquarium looks beautiful now.',
          rating: 5,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Mike Chen',
          feedback: 'Excellent customer service and the fish arrived healthy and vibrant. Highly recommend AquaLink for all your fish needs!',
          rating: 5,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-black bg-clip-text text-transparent">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about their AquaLink experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <Card className="border-border/50 shadow-xl bg-gradient-to-br from-background to-secondary/10">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                {/* Quote Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-primary" />
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6 italic">
                  "{testimonials[currentIndex]?.feedback}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {renderStars(testimonials[currentIndex]?.rating || 5)}
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground">
                      {testimonials[currentIndex]?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Verified Customer
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Testimonial Counter */}
          {testimonials.length > 1 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} of {testimonials.length} testimonials
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
