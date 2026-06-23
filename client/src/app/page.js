"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "Electronics", "Appliances", "Plumbing", "Cleaning"];

  useEffect(() => {
    if (!authLoading && user?.role === "vendor") {
      router.push("/vendor/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/service/all");
        setServices(response.data.services || []);
      } catch (err) {
        console.error("Failed to load marketplace services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredAndSortedServices = services
    .filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const serviceCategory = service.category || (service.description.toLowerCase().includes("phone") || service.description.toLowerCase().includes("screen") ? "Electronics" : "Appliances");
      const matchesCategory = selectedCategory === "All" || serviceCategory.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.basePrice - b.basePrice;
      if (sortBy === "price-high") return b.basePrice - a.basePrice;
      if (sortBy === "alphabetical") return a.name.localeCompare(b.name);
      return 0;
    });

  if (authLoading || user?.role === "vendor") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] text-slate-500">
        Routing to your workspace portal...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Quality Repairs, Delivered.
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Book trusted professionals for all your home and device repair needs.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search for screen repair, diagnostics, cleaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border-slate-200 text-slate-900 focus-visible:ring-blue-500"
            />
          </div>

          <div className="w-full md:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="default">Sort by: Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alphabetical">A-Z Alphabetical</option>
            </select>
          </div>

        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading repair catalog...</div>
      ) : filteredAndSortedServices.length === 0 ? (
        <div className="text-center text-slate-400 border border-dashed rounded-xl p-12 bg-slate-50">
          No repair services match your search filters or category parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAndSortedServices.map((service) => (
            <div key={service._id} className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{service.description}</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-lg font-bold text-slate-900">₹{service.basePrice}</span>
                <Link href={`/book/${service._id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
