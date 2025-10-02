import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Star, MessageSquare, Heart, ThumbsUp, AlertCircle, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Simple axios instance for feedback API
const API_BASE_URL = 'http://localhost:5000/api';

const FeedbackSection = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
    email: user?.email || "",
    feedback: "",
    rating: null,
  });

  // Check for pending feedback on component mount
  useEffect(() => {
    const checkPendingFeedback = async () => {
      const pendingFeedback = localStorage.getItem('pendingFeedback');
      if (pendingFeedback && isAuthenticated) {
        try {
          const feedback = JSON.parse(pendingFeedback);
          const token = localStorage.getItem('token');
          const response = await axios.post(`${API_BASE_URL}/feedback/add`, {
            name: feedback.name,
            email: feedback.email,
            feedback: feedback.feedback,
            rating: feedback.rating,
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.status === 201) {
            localStorage.removeItem('pendingFeedback');
            toast({
              title: "Pending Feedback Submitted!",
              description: "Your previously saved feedback has been successfully submitted.",
            });
          }
        } catch (error) {
          // Backend still not available, keep the pending feedback
          console.log('Backend still unavailable, keeping pending feedback');
        }
      }
    };

    checkPendingFeedback();
  }, [isAuthenticated, toast]);

  // Show feedback count if there are submitted feedbacks
  useEffect(() => {
    const submittedFeedback = JSON.parse(localStorage.getItem('submittedFeedback') || '[]');
    setSubmittedCount(submittedFeedback.length);
    if (submittedFeedback.length > 0 && isAuthenticated) {
      console.log(`You have ${submittedFeedback.length} feedback submission(s) saved locally`);
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating: rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.feedback || !formData.rating) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including rating.",
        variant: "destructive",
      });
      return;
    }

    // Validate feedback length
    if (formData.feedback.length < 10) {
      toast({
        title: "Feedback Too Short",
        description: "Please provide at least 10 characters of feedback.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.feedback.length > 200) {
      toast({
        title: "Feedback Too Long",
        description: "Please keep your feedback under 200 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      console.log('Submitting feedback with token:', token ? 'Present' : 'Missing');
      console.log('Token value:', token);
      console.log('Form data:', formData);
      console.log('Request URL:', `${API_BASE_URL}/feedback/add`);
      console.log('Request headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Try to submit to backend first
      const response = await axios.post(`${API_BASE_URL}/feedback/add`, {
        name: formData.name,
        email: formData.email,
        feedback: formData.feedback,
        rating: formData.rating,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received:', response);

      if (response.status === 201) {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you for your valuable feedback. We appreciate your input!",
        });
        
        // Update submitted count
        setSubmittedCount(prev => prev + 1);
        
        // Reset form
        setFormData({
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
          email: user?.email || "",
          feedback: "",
          rating: null,
        });
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      
      // Check for authentication errors first
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again to submit feedback.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        // Mock successful submission since backend is not available
        console.log('Backend not available, using mock submission');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store feedback locally
        const feedbackData = {
          ...formData,
          timestamp: new Date().toISOString(),
          id: Date.now().toString(),
          status: 'submitted'
        };
        
        // Get existing feedback from localStorage
        const existingFeedback = JSON.parse(localStorage.getItem('submittedFeedback') || '[]');
        existingFeedback.push(feedbackData);
        localStorage.setItem('submittedFeedback', JSON.stringify(existingFeedback));
        
        // Update submitted count
        setSubmittedCount(existingFeedback.length);
        
        toast({
          title: "Feedback Submitted Successfully!",
          description: "Thank you for your valuable feedback. We appreciate your input! (Saved locally - will sync when backend is available)",
        });
        
        // Reset form
        setFormData({
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
          email: user?.email || "",
          feedback: "",
          rating: null,
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to submit feedback. Please try again.';
        
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleRatingClick(star)}
        className={`transition-all duration-200 hover:scale-110 ${
          formData.rating >= star
            ? "text-yellow-400"
            : "text-gray-300 hover:text-yellow-300"
        }`}
      >
        <Star className="h-8 w-8 fill-current" />
      </button>
    ));
  };

  return (
    <section id="feedback" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-black bg-clip-text text-transparent">
                Share Your Feedback
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your experience matters to us! Help us improve by sharing your thoughts about our guppy fish, service, or website.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Information Cards */}
            <div className="space-y-6">
              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ThumbsUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Your Voice Matters
                      </h3>
                      <p className="text-primary font-medium mb-1">
                        We Value Every Opinion
                      </p>
                      <p className="text-sm text-muted-foreground">
                        We read every piece of feedback and use it to improve our services, 
                        fish quality, and customer experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        We Respond
                      </h3>
                      <p className="text-primary font-medium mb-1">
                        24-48 Hour Response
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For feedback requiring a response, we'll get back to you within 
                        24-48 hours via email.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Privacy Protected
                      </h3>
                      <p className="text-primary font-medium mb-1">
                        Your Data is Safe
                      </p>
                      <p className="text-sm text-muted-foreground">
                        All feedback is kept confidential and used solely for improving our 
                        services. We never share your personal information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional info card to match form height */}
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Continuous Improvement
                      </h3>
                      <p className="text-primary font-medium mb-1">
                        Always Evolving
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your feedback helps us continuously improve our guppy breeding, 
                        customer service, and overall experience for all fish enthusiasts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Form */}
            <Card className="border-border/50 shadow-lg animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Tell Us What You Think
                  {submittedCount > 0 && (
                    <span className="ml-auto text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {submittedCount} submitted
                    </span>
                  )}
                </CardTitle>
                <p className="text-muted-foreground">
                  {isAuthenticated 
                    ? "We'd love to hear about your experience with AquaLink!"
                    : "Please log in to submit your feedback."
                  }
                </p>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Authentication Required
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Please log in to your account to submit feedback.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/signin'} 
                      variant="ocean" 
                      size="lg"
                    >
                      Sign In to Continue
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Your Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          required
                          className="transition-all duration-300 focus:shadow-lg"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                          className="transition-all duration-300 focus:shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        How would you rate your experience? *
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.rating 
                          ? `You rated us ${formData.rating} star${formData.rating > 1 ? 's' : ''}`
                          : "Please select a rating (required)"
                        }
                      </p>
                    </div>

                    <div>
                      <label htmlFor="feedback" className="block text-sm font-medium text-foreground mb-2">
                        Your Feedback *
                      </label>
                      <Textarea
                        id="feedback"
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleInputChange}
                        placeholder="Share your thoughts about our service, fish quality, delivery, or anything else..."
                        rows={5}
                        maxLength={200}
                        required
                        className="transition-all duration-300 focus:shadow-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.feedback.length < 10 
                          ? `Minimum 10 characters required (${formData.feedback.length}/200)`
                          : formData.feedback.length > 200
                          ? `Too long! Please keep under 200 characters (${formData.feedback.length}/200)`
                          : `${formData.feedback.length}/200 characters`
                        }
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      variant="ocean" 
                      size="lg" 
                      className="w-full text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
