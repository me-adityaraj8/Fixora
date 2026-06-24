"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getMyBookings } from "@/services/booking.service";
import { createReview } from "@/services/review.service";
import api from "@/services/api";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const orderStages = ["Submitted", "Accepted", "Processing", "Completed"];

  const getStageIndex = (status) => {
    if (status === "pending") return 0;
    if (status === "accepted") return 1;
    if (status === "completed") return 3;
    return 0;
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      if (Array.isArray(data)) setBookings(data);
      else if (data && Array.isArray(data.bookings)) setBookings(data.bookings);
      else setBookings([]);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Dynamically load the Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (bookingId, amount) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // 1. Ask backend to create a secure Order ID
      const { data: order } = await api.post("/payment/create-order", { bookingId, amount });

      // 2. Initialize the Razorpay Checkout Modal
      const options = {
        key:"rzp_test_T5WQyILijbrTt9", 
        amount: order.amount,
        currency: order.currency,
        name: "Fixora",
        description: "Payment for Service",
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#2563EB", // Matches your Tailwind blue-600
        },
        // 3. Handle the success callback
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payment/verify", {
              ...response,
              bookingId,
            });

            if (verifyRes.data.success) {
              alert("Payment successful! Your receipt has been generated.");
              fetchBookings(); // Refresh the UI to show the 'Paid' badge
            }
          } catch (err) {
            alert(err.response?.data?.message || "Payment verification failed.");
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Server error while initiating payment.");
    }
  };

  const handleReview = async (bookingId) => {
    const rating = window.prompt("Rate the service out of 5:");
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return alert("Invalid rating. Must be 1-5.");
    
    const comment = window.prompt("Leave a comment for the professional:");
    try {
      await createReview({ bookingId, rating: Number(rating), comment });
      alert("Review submitted successfully!");
      fetchBookings();
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-6">
            <h2 className="text-sm font-medium text-slate-500 mb-1">My Bookings</h2>
            <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-6">
            <h2 className="text-sm font-medium text-slate-500 mb-1">Completed</h2>
            <p className="text-3xl font-bold text-green-600">{completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-6">
            <h2 className="text-sm font-medium text-slate-500 mb-1">Pending</h2>
            <p className="text-3xl font-bold text-yellow-500">{pending}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const currentStageIndex = getStageIndex(booking.status);
              
              return (
                <div key={booking._id} className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-lg text-slate-900">{booking.service?.name}</p>
                      <p className="text-sm text-slate-500">Professional: {booking.vendor?.businessName || "Vendor Assigned"}</p>
                      <p className="text-sm text-slate-400 mt-0.5">Total due: ₹{booking.service?.basePrice}</p>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {booking.status === "completed" && booking.paymentStatus === "pending" && (
                        <button onClick={() => handlePayment(booking._id, booking.service?.basePrice)} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                          Pay Now
                        </button>
                      )}
                      {booking.status === "completed" && booking.paymentStatus === "paid" && (
                        <button onClick={() => handleReview(booking._id)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                          Leave Review
                        </button>
                      )}
                      {booking.paymentStatus === "paid" && (
                        <span className="text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-md border border-green-200/50">✓ Paid</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="relative flex items-center justify-between w-full">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0"></div>
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-500"
                        style={{ width: `${(currentStageIndex / (orderStages.length - 1)) * 100}%` }}
                      ></div>

                      {orderStages.map((stage, index) => {
                        const isCompleted = index <= currentStageIndex;
                        const isActive = index === currentStageIndex;
                        
                        return (
                          <div key={stage} className="relative z-10 flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCompleted 
                                ? "bg-blue-600 text-white ring-4 ring-blue-50" 
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}>
                              {index + 1}
                            </div>
                            <span className={`text-xs font-semibold mt-2 ${
                              isActive ? "text-blue-600" : isCompleted ? "text-slate-800" : "text-slate-400"
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
