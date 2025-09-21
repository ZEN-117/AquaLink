import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626"
        }
      });
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626"
        }
      });
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success("Login successful!", {
        position: "top-center",
        style: {
          background: "#22c55e",
          color: "white",
          border: "1px solid #16a34a"
        }
      });
      // Navigate based on role
      if (result.role === "User") {
        navigate("/userdashboard");
      } else if (result.role === "admin") {
        navigate("/dashboard");
      }
    } else {
      // Error message will be shown via toast from AuthContext
      toast.error(result.error || "Login failed. Please try again.", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626"
        }
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="backdrop-blur-sm bg-background/95 border-aqua/20 shadow-glow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-aqua rounded-full flex items-center justify-center animate-scale-in">
              <Fish className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your AquaFlow account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-aqua/20 focus:border-aqua"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="border-aqua/20 focus:border-aqua pr-10"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              
              <div className="flex items-center justify-between">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-aqua hover:text-aqua-light transition-colors story-link"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-aqua hover:text-aqua-light transition-colors story-link"
                >
                  Sign up
                </Link>
              </p>
              
              <div className="pt-2 border-t border-aqua/10">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-aqua transition-colors story-link"
                >
                  ← Go to Home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
