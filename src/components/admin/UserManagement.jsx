import { useState, useEffect } from "react";
import axios from "axios";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Password handling states
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Owner":
        return "default";
      case "Staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeColor = (isBlocked) => {
    return !isBlocked ? "default" : "secondary"; // Active if not blocked
  };

  // Handle delete
  const handleDelete = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${email}`);
      setUsers(users.filter((u) => u.email !== email));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Handle update save
  const handleUpdate = async (e) => {
    e.preventDefault();

    // If password input not shown, prevent overwriting with blank
    const payload = { ...selectedUser };
    if (!showPasswordInput) {
      delete payload.password;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${selectedUser.email}`,
        payload
      );
      const updatedUser = res.data.user;
      setUsers(
        users.map((u) => (u.email === updatedUser.email ? updatedUser : u))
      );
      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-aqua/10">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(user.isBlocked)}>
                        {user.isBlocked ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isEmailVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        className="hover:bg-gray-300 focus:bg-gray-300"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser({ ...user });
                          setShowPassword(false);
                          setShowPasswordInput(false);
                          setShowModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                        onClick={() => handleDelete(user.email)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Popup */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-3xl w-3xl bg-gray-200">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and save changes
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form onSubmit={handleUpdate} className="space-y-5 mt-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={selectedUser.email} disabled />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  value={selectedUser.firstName}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, firstName: e.target.value })
                  }
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  value={selectedUser.lastName}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, lastName: e.target.value })
                  }
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User" className="hover:bg-gray-300 focus:bg-gray-300">User</SelectItem>
                    <SelectItem value="admin" className="hover:bg-gray-300 focus:bg-gray-300">Admin</SelectItem>
                    <SelectItem value="owner" className="hover:bg-gray-300 focus:bg-gray-300">Owner</SelectItem>
                    <SelectItem value="staff" className="hover:bg-gray-300 focus:bg-gray-300">Staff</SelectItem>
                  </SelectContent>

                </Select>
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                {!showPasswordInput ? (
                  <div className="flex items-center justify-between p-2 border rounded bg-white">
                    <span className="text-gray-500">••••••••</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordInput(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={selectedUser.password || ""}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, password: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Status checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedUser.isBlocked}
                    onCheckedChange={(value) =>
                      setSelectedUser({ ...selectedUser, isBlocked: value })
                    }
                  />
                  Blocked
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedUser.isEmailVerified}
                    onCheckedChange={(value) =>
                      setSelectedUser({ ...selectedUser, isEmailVerified: value })
                    }
                  />
                  Verified
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white">
                  Save
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
