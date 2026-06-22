"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getMyBookings } from "@/services/booking.service";
import { createPayment } from "@/services/payment.service";
import { createReview } from "@/services/review.service";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (bookingId, amount) => {
    if (!window.confirm(`Proceed to pay ₹${amount} via UPI?`)) return;
    try {
      await createPayment({ bookingId, amount, method: "upi" });
      alert("Payment successful!");
      fetchBookings(); // Refresh the list to hide the pay button
    } catch (error) {
      alert("Payment failed. " + (error.response?.data?.message || ""));
    }
  };

  const handleReview = async (bookingId) => {
    const rating = window.prompt("Rate the service out of 5 (e.g., 4 or 5):");
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return alert("Invalid rating. Must be 1-5.");
    
    const comment = window.prompt("Leave a comment for the professional:");
    try {
      await createReview({ bookingId, rating: Number(rating), comment });
      alert("Review submitted successfully! The vendor's rating has been updated.");
      fetchBookings(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review.");
    }
  };

  const completed = bookings.filter((b) => b.status === "completed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mb-8">Here is your Fixora dashboard.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-1">My Bookings</h2>
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

        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        
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
                  <p className="text-sm text-gray-500">Professional: {booking.vendor?.businessName || "Vendor"}</p>
                  <p className="text-sm text-gray-400">Date: {new Date(booking.scheduledAt).toLocaleDateString()}</p>
                  <p className="text-sm font-medium mt-1">Total: ₹{booking.price?.final || booking.service?.basePrice}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    booking.status === "completed" ? "bg-green-100 text-green-700" :
                    booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>

                  {/* Customer Actions */}
                  <div className="flex gap-2 items-center">
                    {booking.status === "completed" && booking.paymentStatus === "pending" && (
                      <button onClick={() => handlePayment(booking._id, booking.service?.basePrice)} className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-700">
                        Pay Now
                      </button>
                    )}
                    {booking.status === "completed" && booking.paymentStatus === "paid" && (
                      <button onClick={() => handleReview(booking._id)} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700">
                        Leave Review
                      </button>
                    )}
                    {booking.paymentStatus === "paid" && (
                        <span className="text-sm text-green-600 font-bold px-2 py-1">✓ Paid</span>
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
