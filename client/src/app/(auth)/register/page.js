"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer", // Default role
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(formData);
      alert("Registration successful! Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-slate-50/50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-200/60">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create an account
          </h1>
          <p className="text-sm text-slate-500">
            Enter your details below to get started with Fixora
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Aditya Raj"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-10 border-slate-200 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-10 border-slate-200 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-10 border-slate-200 focus-visible:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-slate-700 font-medium">Join as a</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="customer">Customer (Looking for services)</option>
              <option value="vendor">Vendor (Offering services)</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors mt-2">
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:underline hover:text-blue-700 transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
