import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage quizzes, users, and view analytics.</p>
      </div>

      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/quizzes" element={<QuizManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/results" element={<ResultsManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

const AdminOverview = () => (
  <div className="card text-center">
    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h2 className="text-xl font-semibold mb-2">Admin Overview</h2>
    <p className="text-gray-600">Welcome to the admin dashboard.</p>
    <p className="text-sm text-gray-500 mt-4">Platform statistics and quick actions will be displayed here.</p>
  </div>
);

const QuizManagement = () => (
  <div className="card text-center">
    <h2 className="text-xl font-semibold mb-2">Quiz Management</h2>
    <p className="text-gray-600">Create, edit, and manage quizzes.</p>
  </div>
);

const UserManagement = () => (
  <div className="card text-center">
    <h2 className="text-xl font-semibold mb-2">User Management</h2>
    <p className="text-gray-600">Manage user accounts and permissions.</p>
  </div>
);

const ResultsManagement = () => (
  <div className="card text-center">
    <h2 className="text-xl font-semibold mb-2">Results Management</h2>
    <p className="text-gray-600">View and analyze quiz results.</p>
  </div>
);

export default AdminDashboard;