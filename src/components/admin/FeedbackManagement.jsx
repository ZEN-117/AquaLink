import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  User,
  Mail,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
    fetchTestimonials();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/feedback/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFeedbacks(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feedbacks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/feedback/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      });
    }
  };

  const handleToggleTestimonial = async (feedbackId, isTestimonial) => {
    try {
      const token = localStorage.getItem('token');
      const action = isTestimonial ? 'remove' : 'add';
      
      await axios.put(`${API_BASE_URL}/feedback/${feedbackId}/testimonial`, 
        { action }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      setFeedbacks(feedbacks.map(f => 
        f._id === feedbackId 
          ? { ...f, isTestimonial: !isTestimonial }
          : f
      ));
      
      if (!isTestimonial) {
        setTestimonials([...testimonials, feedbacks.find(f => f._id === feedbackId)]);
        toast({
          title: "Success",
          description: "Feedback added to testimonials",
        });
      } else {
        setTestimonials(testimonials.filter(t => t._id !== feedbackId));
        toast({
          title: "Success",
          description: "Feedback removed from testimonials",
        });
      }
    } catch (error) {
      console.error('Error toggling testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to update testimonial status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      reviewed: { variant: "default", icon: Eye, text: "Reviewed" },
      responded: { variant: "default", icon: CheckCircle, text: "Responded" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user feedback and testimonials
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {feedbacks.length} | Testimonials: {testimonials.length}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Feedback Yet
              </h3>
              <p className="text-muted-foreground text-center">
                User feedback will appear here once customers start submitting reviews.
              </p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feedback.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {feedback.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(feedback.status)}
                    {feedback.isTestimonial && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Testimonial
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rating */}
                {feedback.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rating:</span>
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({feedback.rating}/5)
                    </span>
                  </div>
                )}

                {/* Feedback Text */}
                <div>
                  <p className="text-foreground leading-relaxed">
                    {feedback.feedback}
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant={feedback.isTestimonial ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleTestimonial(feedback._id, feedback.isTestimonial)}
                    className="flex items-center gap-2"
                  >
                    {feedback.isTestimonial ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Remove from Testimonials
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4" />
                        Add to Testimonials
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFeedback(feedback._id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
