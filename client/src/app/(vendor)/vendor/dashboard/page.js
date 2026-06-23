"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getVendorBookings, updateBookingStatus } from "@/services/booking.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useEffect, useState } from "react";

export default function VendorDashboardGateway() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Onboarding Form State
  const [onboardingData, setOnboardingData] = useState({
    businessName: "",
    description: "",
    address: "",
    contactPhone: ""
  });

  // Senior Dev Pattern: Defensive formatting helper to prevent React child rendering crashes
  const renderSafeAddress = (address) => {
    if (!address) return "No address provided";
    
    // If the data is a structured object, unwrap and parse its keys safely
    if (typeof address === "object") {
      const { street, city, state, pincode } = address;
      return [street, city, state, pincode].filter(Boolean).join(", ");
    }
    
    // Fallback if it is already a flat string format
    return address;
  };

  const checkProfileAndFetchData = async () => {
    try {
      setLoading(true);
      const response = await getVendorBookings();
      setBookings(response.bookings);
      
      const total = response.bookings.length;
      const completed = response.bookings.filter(b => b.status === "completed").length;
      const pending = response.bookings.filter(b => b.status === "pending").length;
      setMetrics({ total, completed, pending });
      setHasProfile(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasProfile(false);
      } else {
        console.error("Error loading dashboard data", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfileAndFetchData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      alert(`Booking updated to ${newStatus}`);
      checkProfileAndFetchData();
    } catch (err) {
      alert("Failed to update booking status.");
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/vendor/profile", onboardingData);
      alert("Business profile configured successfully!");
      setHasProfile(true);
      checkProfileAndFetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile setup.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500">
        Syncing system state...
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {!hasProfile ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Setup Your Shop</h1>
              <p className="text-sm text-slate-500 mt-1">
                Before you can accept service requests, tell customers who you are.
              </p>
            </div>
            
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="businessName">Business or Trade Name</Label>
                <Input 
                  id="businessName" 
                  required 
                  placeholder="e.g., Aditya's Rapid Fixes" 
                  value={onboardingData.businessName}
                  onChange={(e) => setOnboardingData({...onboardingData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Bio / Description of Services</Label>
                <Input 
                  id="description" 
                  required 
                  placeholder="Expert smartphone, laptop, and gadget repairs" 
                  value={onboardingData.description}
                  onChange={(e) => setOnboardingData({...onboardingData, description: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Operating Workshop Address</Label>
                <Input 
                  id="address" 
                  required 
                  placeholder="Street details, City, State" 
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData({...onboardingData, address: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="contactPhone">Business Hotline Phone</Label>
                <Input 
                  id="contactPhone" 
                  required 
                  placeholder="10-digit mobile number" 
                  value={onboardingData.contactPhone}
                  onChange={(e) => setOnboardingData({...onboardingData, contactPhone: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                Launch My Vendor Profile
              </Button>
            </form>
          </div>
        ) : (
          
          <>
            <h1 className="text-2xl font-bold mb-2">Vendor Command Center</h1>
            <p className="text-gray-500 mb-8">Manage active requests and track incoming marketplace revenue.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-medium text-slate-500 mb-1">Total Orders</h2>
                <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-medium text-slate-500 mb-1">Completed</h2>
                <p className="text-3xl font-bold text-green-600">{metrics.completed}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-medium text-slate-500 mb-1">Active / Pending</h2>
                <p className="text-3xl font-bold text-yellow-600">{metrics.pending}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-400 border border-dashed rounded-lg p-8 text-center bg-slate-50">
                No job orders assigned to your profile yet.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-lg border border-slate-100 p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-semibold text-lg text-slate-900">{booking.service?.name}</p>
                      <p className="text-sm text-slate-500">Client: {booking.customer?.name || "Marketplace User"}</p>
                      {/* Senior Dev Note: Patched here to call the defensive formatter */}
                      <p className="text-sm text-slate-400">Location: {renderSafeAddress(booking.address)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      
                      <div className="flex gap-2 mt-2">
                        {booking.status === "pending" && (
                          <Button size="sm" onClick={() => handleStatusChange(booking._id, "accepted")} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Accept Job
                          </Button>
                        )}
                        {booking.status === "accepted" && (
                          <Button size="sm" onClick={() => handleStatusChange(booking._id, "completed")} className="bg-green-600 hover:bg-green-700 text-white">
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
