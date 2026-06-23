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
  const [loading, setLoading] = useState(true);

  const [onboardingData, setOnboardingData] = useState({
    businessName: "",
    description: "",
    address: "",
    contactPhone: ""
  });

  const renderSafeAddress = (address) => {
    if (!address) return "No address provided";
    if (typeof address === "object") {
      const { street, city, state, pincode } = address;
      return [street, city, state, pincode].filter(Boolean).join(", ");
    }
    return address;
  };

  const checkProfileAndFetchData = async () => {
    try {
      setLoading(true);
      const response = await getVendorBookings();
      setBookings(Array.isArray(response.bookings) ? response.bookings : []);
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
      checkProfileAndFetchData();
    } catch (err) {
      // SENIOR DEV PATTERN: Expose the raw API error message instead of a generic string
      console.error("Full Error Details:", err);
      alert(`Update Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/vendor/profile", onboardingData);
      setHasProfile(true);
      checkProfileAndFetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile setup.");
    } finally {
      setLoading(false);
    }
  };

  const totalJobs = bookings.length;
  const completedJobs = bookings.filter(b => b.status === "completed").length;
  const pendingJobs = bookings.filter(b => b.status === "pending" || b.status === "accepted").length;

  const totalRevenue = bookings
    .filter(b => b.status === "completed" && b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.service?.basePrice || 0), 0);

  const projectedRevenue = bookings
    .filter(b => b.status !== "completed")
    .reduce((sum, b) => sum + (b.service?.basePrice || 0), 0);

  const pendingSettlements = bookings
    .filter(b => b.status === "completed" && b.paymentStatus !== "paid")
    .reduce((sum, b) => sum + (b.service?.basePrice || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] text-slate-500 font-medium">
        Syncing financial ledger...
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
                  placeholder="e.g., Fast Fix Electronics" 
                  value={onboardingData.businessName}
                  onChange={(e) => setOnboardingData({...onboardingData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Bio / Description of Services</Label>
                <Input 
                  id="description" 
                  required 
                  placeholder="Expert repairs and diagnostics" 
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
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Financial Ledger</h1>
                <p className="text-gray-500">Track your marketplace revenue and active job queue.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Total Cleared Earnings</p>
                <p className="text-4xl font-extrabold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Jobs</h2>
                <p className="text-2xl font-bold text-slate-900">{totalJobs}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Completed</h2>
                <p className="text-2xl font-bold text-blue-600">{completedJobs}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pending Pay</h2>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingSettlements.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pipeline Vol</h2>
                <p className="text-2xl font-bold text-slate-400">₹{projectedRevenue.toLocaleString()}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-slate-900">Active Job Orders</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-400 border border-dashed rounded-xl p-10 text-center bg-slate-50">
                Your queue is empty. Waiting for marketplace requests.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-xl border border-slate-200/60 p-6 flex flex-col md:flex-row justify-between md:items-center shadow-sm gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-lg text-slate-900">{booking.service?.name}</p>
                        <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded">₹{booking.service?.basePrice}</span>
                      </div>
                      <p className="text-sm text-slate-500">Client: {booking.customer?.name || "Marketplace User"}</p>
                      <p className="text-sm text-slate-400">Location: {renderSafeAddress(booking.address)}</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                          booking.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.paymentStatus === "paid" && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide bg-green-100 text-green-800">
                            PAID
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <Button size="sm" onClick={() => handleStatusChange(booking._id, "accepted")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            Accept Request
                          </Button>
                        )}
                        {booking.status === "accepted" && (
                          <Button size="sm" onClick={() => handleStatusChange(booking._id, "completed")} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
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
