import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useUserDetails } from '../hooks/useUserDetails';
import { useAuth } from '../contexts/AuthContext';

/**
 * Example component showing how to access and display user details
 */
const UserDetailsExample = () => {
  const { 
    user, 
    fullName, 
    email, 
    role, 
    isAdmin, 
    isUser, 
    isLoggedIn,
    displayName,
    userInitials 
  } = useUserDetails();
  
  const { logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Details Example</CardTitle>
          <CardDescription>Please sign in to see user details</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Details Example</CardTitle>
          <CardDescription>How to access and display user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Full Name:</strong> {fullName}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Display Name:</strong> {displayName}</p>
                <p><strong>Initials:</strong> {userInitials}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Role & Permissions</h4>
              <div className="space-y-2">
                <Badge variant={isAdmin ? 'destructive' : 'default'}>
                  {role}
                </Badge>
                <div className="text-sm space-y-1">
                  <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                  <p>Is User: {isUser ? 'Yes' : 'No'}</p>
                  <p>Is Logged In: {isLoggedIn ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Raw User Data</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailsExample;
