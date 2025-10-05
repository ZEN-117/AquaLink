import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Eye, EyeOff, Check, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Email validation rules
  const emailValidation = {
    hasAt: formData.email.includes("@"),
    hasDomain: formData.email.includes(".") && formData.email.split("@")[1]?.includes("."),
    validChars: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email),
    noStartPeriod: !formData.email.startsWith("."),
    noEndPeriod: !formData.email.split("@")[0]?.endsWith("."),
    noConsecutivePeriods: !formData.email.split("@")[0]?.includes(".."),
    validLength: formData.email.length > 0 && formData.email.length <= 254
  };

  const isEmailValid = Object.values(emailValidation).every(Boolean);

  // Password validation rules
  const passwordValidation = {
    length: formData.password.length >= 8 && formData.password.length <= 20,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic field validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
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

    // Email validation
    if (!isEmailValid) {
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

    // Password validation
    if (!isPasswordValid) {
      toast.error("Password does not meet requirements", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626"
        }
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };
      await axios.post("http://localhost:5000/api/users", payload);
      
      toast.success("Account created successfully! Please sign in.", {
        position: "top-center",
        style: {
          background: "#22c55e",
          color: "white",
          border: "1px solid #16a34a"
        }
      });
      
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", {
        position: "top-center",
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
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
              <CardTitle className="text-2xl font-bold text-foreground">Join AquaLink</CardTitle>
              <CardDescription className="text-muted-foreground">
                Start your premium guppy distribution journey
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="border-aqua/20 focus:border-aqua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="border-aqua/20 focus:border-aqua"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`border-aqua/20 focus:border-aqua ${
                    formData.email && !isEmailValid ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {formData.email && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${emailValidation.hasAt ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.hasAt ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Contains @ symbol</span>
                    </div>
                    <div className={`flex items-center gap-2 ${emailValidation.hasDomain ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.hasDomain ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Valid domain format</span>
                    </div>
                    <div className={`flex items-center gap-2 ${emailValidation.validChars ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.validChars ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Only letters, numbers, ., -, _ allowed</span>
                    </div>
                    <div className={`flex items-center gap-2 ${emailValidation.noStartPeriod ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.noStartPeriod ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Cannot start with period</span>
                    </div>
                    <div className={`flex items-center gap-2 ${emailValidation.noEndPeriod ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.noEndPeriod ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Cannot end with period</span>
                    </div>
                    <div className={`flex items-center gap-2 ${emailValidation.noConsecutivePeriods ? 'text-green-600' : 'text-red-500'}`}>
                      {emailValidation.noConsecutivePeriods ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>No consecutive periods</span>
                    </div>
                  </div>
                )}
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>8-20 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least one uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least one lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least one number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordValidation.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least one special character (!@#$%^&*)</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-aqua/20 focus:border-aqua"
                />
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {passwordValidation.match ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105" >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  to="/signin" 
                  className="text-aqua hover:text-aqua-light transition-colors story-link"
                >
                  Sign in
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

export default SignUp;
