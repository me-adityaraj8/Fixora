"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getVendorBookings, updateBookingStatus } from "@/services/booking.service";
import { useEffect, useState } from "react";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getVendorBookings();
        setBookings(data.bookings);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, { status: newStatus, note: `Status updated to ${newStatus}` });
      // Update local UI state immediately
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  const completed = bookings.filter((b) => b.status === "completed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-gray-500 mb-8">Manage your bookings and services.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Total Bookings</h2>
            <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Completed</h2>
            <p className="text-3xl font-bold text-green-600">{completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Pending</h2>
            <p className="text-3xl font-bold text-yellow-500">{pending}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Incoming Bookings</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-lg">{booking.service?.name || "Service"}</p>
                  <p className="text-sm text-gray-500">Customer: {booking.customer?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-400">Scheduled: {new Date(booking.scheduledAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-1">Address: {booking.address?.street}, {booking.address?.city}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    booking.status === "completed" ? "bg-green-100 text-green-700" :
                    booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>

                  {/* Vendor Action Buttons */}
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <>
                        <button onClick={() => handleStatusChange(booking._id, "accepted")} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700">Accept</button>
                        <button onClick={() => handleStatusChange(booking._id, "rejected")} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm hover:bg-red-200">Reject</button>
                      </>
                    )}
                    {booking.status === "accepted" && (
                      <button onClick={() => handleStatusChange(booking._id, "completed")} className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-700">Mark Completed</button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
