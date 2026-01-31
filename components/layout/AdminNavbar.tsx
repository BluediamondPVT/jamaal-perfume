"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Home } from "lucide-react";
import { SignOutButton, UserButton } from "@clerk/nextjs";

export default function AdminNavbar() {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <Home className="w-5 h-5" />
          Admin Dashboard
        </Link>

        <div className="flex items-center gap-4">
          {/* Settings Button */}
          <Link href="/admin/settings">
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>

          {/* User Profile */}
          <UserButton afterSignOutUrl="/sign-in" />

          {/* Logout Button */}
          <SignOutButton>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
