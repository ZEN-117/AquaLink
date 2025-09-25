import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Phone, MapPin, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  console.log('UserProfile component loaded');
  console.log('User data:', user);
  console.log('Token:', token);
  
  // Form state for user details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    image: ''
  });
  
  
  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        image: user.image || ''
      });
    }
  }, [user]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  
  // Update user details
  const handleUpdateUser = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await axios.put('http://localhost:5000/api/users/update', {
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        image: formData.image
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.message === 'User updated successfully') {
        // Update the user data in context
        updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          image: formData.image
        });
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  
  // Delete user account
  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await axios.delete('http://localhost:5000/api/users/delete', {
        data: { email: user.email },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.message === 'User deleted successfully') {
        toast.success('Account deleted successfully');
        logout();
        navigate('/');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadReport = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/users/report", {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "User_Management_Report.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    toast.error("Failed to download report");
  }
};


  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };
  
  // Format member since date
  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    }
    return 'Recently';
  };

  if (!user) {
    console.log('No user data found, showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Loading user profile...</p>
          <p className="text-sm text-muted-foreground">
            If this persists, please check if you're logged in.
          </p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Auth Debug Info:');
                console.log('- Token:', localStorage.getItem('token'));
                console.log('- Role:', localStorage.getItem('role'));
                console.log('- UserData:', localStorage.getItem('userData'));
                console.log('- AuthContext user:', user);
                console.log('- AuthContext token:', token);
              }}
            >
              Debug Auth State
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/signin')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
        <p className="text-muted-foreground">Manage your account settings and seller profile</p>
   <Button
  onClick={downloadReport}
  className="bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105"
>
  Export User Report
</Button>



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1 animate-fade-in border-aqua/10">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={user.image || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="bg-accent text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black hover:bg-aqua-dark"
                onClick={() => {
                  const imageUrl = prompt('Enter image URL:');
                  if (imageUrl) {
                    setFormData(prev => ({ ...prev, image: imageUrl }));
                  }
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="mt-4">
              {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription>{user.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-aqua" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-aqua" />
                <span>Member since {getMemberSince()}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-aqua/10">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${user.isEmailVerified ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-600'} text-white`}>
                  {user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                </Badge>
                <Badge className={`${user.role === 'admin' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-primary to-aqua'} text-white`}>
                  {user.role}
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border-aqua/20 focus:border-aqua text-base"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  disabled
                  className="border-aqua/20 focus:border-aqua text-base bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input 
                  id="image" 
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="border-aqua/20 focus:border-aqua text-base"
                />
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="bg-gradient-to-r from-primary to-black text-white hover:opacity-90 transition-all duration-300 hover:scale-105" 
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    image: user.image || ''
                  });
                }}
                className="border-aqua/20 hover:bg-aqua/60 transition-transform duration-200 hover:scale-105"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Danger Zone */}
      <Card className="animate-fade-in border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
            <div>
              <h4 className="font-semibold text-red-600">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers. You will be logged out immediately
                    and will not be able to recover your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;