import React from 'react';
import { User } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="card text-center">
      <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold mb-2">Profile Page</h2>
      <p className="text-gray-600">Manage your account settings and personal information.</p>
      <p className="text-sm text-gray-500 mt-4">Update your profile, change password, and view account statistics.</p>
    </div>
  );
};

export default ProfilePage;