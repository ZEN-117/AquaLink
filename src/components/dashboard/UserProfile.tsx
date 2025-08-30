import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Phone, MapPin, Calendar, Star } from "lucide-react";

const UserProfile = () => {
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
                <AvatarFallback className="bg-gradient-aqua text-white text-xl">JD</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-aqua hover:bg-aqua-dark"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="mt-4">John Doe</CardTitle>
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
                <span>john.doe@email.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-aqua" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-aqua" />
                <span>California, USA</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-aqua" />
                <span>Member since Jan 2023</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-aqua/10">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-aqua/10 text-aqua">Verified Seller</Badge>
                <Badge className="bg-green-500/10 text-green-500">Top Rated</Badge>
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
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue="John"
                    className="border-aqua/20 focus:border-aqua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue="Doe"
                    className="border-aqua/20 focus:border-aqua"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue="john.doe@email.com"
                  className="border-aqua/20 focus:border-aqua"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    defaultValue="+1 (555) 123-4567"
                    className="border-aqua/20 focus:border-aqua"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    defaultValue="California, USA"
                    className="border-aqua/20 focus:border-aqua"
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
                  placeholder="Tell potential buyers about your breeding experience, specialties, and what makes your guppies special..."
                  rows={4}
                  defaultValue="Passionate guppy breeder with over 5 years of experience. Specializing in premium bloodlines including Moscow, Delta, and Rainbow varieties. All fish are carefully bred in optimal conditions with health guarantees."
                  className="border-aqua/20 focus:border-aqua"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button className="bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105" >
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="border-aqua/20 hover:bg-aqua/60 transition-transform duration-200 hover:scale-105"
              >
                Cancel
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