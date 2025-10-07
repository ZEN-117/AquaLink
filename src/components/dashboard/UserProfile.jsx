import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Mail, Calendar, Trash2, AlertTriangle, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks/useChangePassword";
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

const UserProfile = () => {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
 const { mutate: changePassword, isPending: isChanging } = useChangePassword(logout, navigate);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        image: user.image || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/update",
        {
          email: user.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          image: formData.image,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === "User updated successfully") {
        updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          image: formData.image,
        });
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/users/delete",
        {
          data: { email: user.email },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === "User deleted successfully") {
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  // Inside UserProfile component

const handleChangePassword = () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.error("New passwords do not match");
    return;
  }

  changePassword({
    email: user.email,
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
  });

  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
};

  

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  const getUserInitials = () =>
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : "U";

  const getMemberSince = () =>
    user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "Recently";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage your account settings and security preferences
        </p>
        
      </div>

      {/* Profile and Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-aqua/10">
          <CardHeader className="text-center">
            <Avatar className="w-32 h-32 mx-auto">
              <AvatarImage src={user.image || "/placeholder-avatar.jpg"} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="mt-3 bg-black text-white"
              onClick={() => {
                const imageUrl = prompt("Enter image URL:");
                if (imageUrl) setFormData((prev) => ({ ...prev, image: imageUrl }));
              }}
            >
              <Camera className="w-4 h-4 mr-1" /> Change Photo
            </Button>
            <CardTitle className="mt-4">{user.firstName} {user.lastName}</CardTitle>
            <CardDescription>{user.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-aqua" /> {user.email}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-aqua" /> Member since {getMemberSince()}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge className={user.isEmailVerified ? "bg-blue-600" : "bg-yellow-600"}>
                {user.isEmailVerified ? "Email Verified" : "Not Verified"}
              </Badge>
              <Badge className={user.role === "admin" ? "bg-red-600" : "bg-primary"}>
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="lg:col-span-2 border-aqua/10">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your information and password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled />
            </div>

            <div>
              <Label>Profile Image URL</Label>
              <Input name="image" value={formData.image} onChange={handleInputChange} />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFormData({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    image: user.image || "",
                  })
                }
              >
                Reset
              </Button>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-aqua/10">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-aqua" /> Change Password
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChanging}
                className="mt-4 bg-gradient-to-r from-aqua to-primary text-white hover:opacity-90"
              >
                {isChanging ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Delete your account permanently</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone and will remove all your data permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600">
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
