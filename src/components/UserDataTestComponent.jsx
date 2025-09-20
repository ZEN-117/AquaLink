import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useUserDetails } from '../hooks/useUserDetails';

/**
 * Test component to verify user data from backend response
 */
const UserDataTestComponent = () => {
  const { user, token, role, isAuthenticated } = useAuth();
  const { fullName, email, isAdmin, displayName } = useUserDetails();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Data Test</CardTitle>
          <CardDescription>Please sign in to test user data from backend</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Data Test</CardTitle>
        <CardDescription>Testing user data received from backend response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Extracted User Data</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Full Name:</strong> {fullName}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Display Name:</strong> {displayName}</p>
              <p><strong>Role:</strong> <Badge variant={isAdmin ? 'destructive' : 'default'}>{role}</Badge></p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Raw Data</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Token (first 50 chars):</strong> {token?.substring(0, 50)}...</p>
              <p><strong>User Object:</strong></p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Backend User Data</h4>
          <p className="text-sm text-muted-foreground mb-2">
            The user data is received directly from your backend response. Your backend sends:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>email: {user?.email || 'Not found'}</li>
            <li>firstName: {user?.firstName || 'Not found'}</li>
            <li>lastName: {user?.lastName || 'Not found'}</li>
            <li>role: {user?.role || 'Not found'}</li>
            <li>isEmailVerified: {user?.isEmailVerified !== undefined ? String(user.isEmailVerified) : 'Not found'}</li>
            <li>createdAt: {user?.createdAt || 'Not found'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDataTestComponent;
