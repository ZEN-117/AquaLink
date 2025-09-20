import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Phone, MapPin, Calendar, Star } from "lucide-react";

const UserProfile = () => {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [location, setLocation] = useState("California, USA");
  const [bio, setBio] = useState("Passionate guppy breeder with over 5 years of experience. Specializing in premium bloodlines including Moscow, Delta, and Rainbow varieties. All fish are carefully bred in optimal conditions with health guarantees.");

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token"); // adjust if using different auth
      const response = await fetch("http://localhost:5000/api/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }), // send current user email
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile deleted successfully!");
        // Redirect to homepage or login page
        window.location.href = "/";
      } else {
        alert(data.message || "Failed to delete profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
        <p className="text-muted-foreground">Manage your account settings and seller profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1 animate-fade-in border-aqua/10">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-accent text-white text-xl">JD</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black hover:bg-aqua-dark"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="mt-4">{firstName} {lastName}</CardTitle>
            <CardDescription>Premium Guppy Breeder</CardDescription>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">4.9</span>
              <span className="text-sm text-muted-foreground">(127 reviews)</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-aqua" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-aqua" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-aqua" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-aqua" />
                <span>Member since Jan 2023</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-aqua/10">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-primary to-aqua text-white">
                  Verified Seller
                </Badge>
                <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white">
                  Top Rated
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="lg:col-span-2 animate-fade-in border-aqua/10">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-aqua/20 focus:border-aqua text-base"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
              </div>
            </div>

            {/* Seller Bio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Seller Profile</h3>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio/Description</Label>
                <Textarea 
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="border-aqua/20 focus:border-aqua text-base"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button className="bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105">
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="border-aqua/20 hover:bg-aqua/60 transition-transform duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="animate-fade-in border-aqua/10">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your account security and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password"
                className="border-aqua/20 focus:border-aqua"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                className="border-aqua/20 focus:border-aqua"
              />
            </div>
          </div>
          
          <Button className="bg-gradient-aqua hover:opacity-90">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
