"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LogOut,
  Settings,
  Bell,
  Shield,
  Database,
  Palette,
  Key,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  const settingsSections = [
    {
      id: "general",
      label: "General Settings",
      icon: Settings,
      description: "Basic store configuration",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Email and alerts settings",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password and access control",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Theme and UI customization",
    },
    {
      id: "database",
      label: "Database",
      icon: Database,
      description: "Data management",
    },
  ];

  const handleExportData = async () => {
    try {
      toast.loading("Exporting data...");
      const response = await fetch("/api/admin/export-data");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jammal-perfume-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your store configuration and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left px-6 py-4 border-b transition-colors ${
                      activeTab === section.id
                        ? "bg-blue-50 border-l-4 border-l-blue-600 text-blue-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-semibold text-sm">{section.label}</p>
                        <p className="text-xs text-gray-500">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Logout Section */}
              <div className="border-t mt-4 pt-4 px-6 pb-6">
                <SignOutButton>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </SignOutButton>
              </div>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <Input
                      defaultValue="Jammal Perfume"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <Input
                      type="email"
                      defaultValue="admin@jammal-perfume.com"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      defaultValue="+91 9876543210"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <Input
                      defaultValue="INR (₹)"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Contact support to modify store settings
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Order Notifications</p>
                      <p className="text-sm text-gray-600">Get notified when customers place orders</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-600">Alert when product stock is low</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Customer Reviews</p>
                      <p className="text-sm text-gray-600">Notify about new customer reviews</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">Save Notification Settings</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <p className="font-medium text-blue-900">Account Security</p>
                    </div>
                    <p className="text-sm text-blue-800">
                      Your account is protected by Clerk authentication with OAuth support
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Admin Access</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">✓ Two-factor authentication enabled</p>
                      <p className="text-gray-600">✓ Secure password required</p>
                      <p className="text-gray-600">✓ Session timeout: 24 hours</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-4">
                      For additional security measures, contact your system administrator
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
                <div className="space-y-6">
                  <div>
                    <p className="font-medium text-gray-900 mb-4">Theme</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-blue-600 rounded-lg cursor-pointer bg-white">
                        <p className="font-medium">Light Mode (Active)</p>
                        <p className="text-sm text-gray-600">Clean and bright interface</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-gray-600">Easy on the eyes</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">Save Appearance Settings</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Database */}
            {activeTab === "database" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Database & Backup</h2>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg bg-amber-50">
                    <p className="text-sm text-amber-900 font-medium">
                      📊 Database: SQLite (jammal-perfume)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Export All Data (JSON)
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled
                      >
                        🗑️ Clear All Data (Disabled)
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50 text-sm">
                    <p className="font-medium text-gray-900 mb-2">Backup Information</p>
                    <p className="text-gray-600">
                      Last backup: Today at 00:00 AM
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
