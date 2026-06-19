"use client";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mb-8">Here is your Fixora dashboard.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">My Bookings</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Total bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Completed</h2>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Services completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Pending</h2>
            <p className="text-3xl font-bold text-yellow-500">0</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
