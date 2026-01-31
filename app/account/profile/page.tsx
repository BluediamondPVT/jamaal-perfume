"use client";

import { useEffect, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Package,
  Heart,
  LogOut,
  Loader2,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  estimatedDeliveryDate: string | null;
  address: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  discount?: number;
  category?: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  ON_THE_WAY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function UserProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchWishlist();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/user-orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      setRemovingWishlistId(productId);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action: "remove" }),
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");
      toast.success("Removed from wishlist");
      setWishlist(wishlist.filter((p) => p.id !== productId));
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingWishlistId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - User Info & Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              {/* User Avatar & Name */}
              <div className="text-center mb-6">
                {user.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt={user.username || "User"}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100"
                  />
                )}
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
              </div>

              <div className="border-t border-b py-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {user.createdAt ? formatDate(user.createdAt.toISOString()) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2 mb-6">
                {[
                  { id: "profile", label: "Profile Info", icon: User },
                  { id: "orders", label: "Orders", icon: Package },
                  { id: "wishlist", label: "Wishlist", icon: Heart },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <SignOutButton>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold text-sm">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </SignOutButton>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Account Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user.firstName || ""}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user.lastName || ""}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.primaryEmailAddress?.emailAddress || ""}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-900">
                      ℹ️ Edit your profile information in Clerk settings or contact support for
                      account changes.
                    </p>
                  </div>

                  {/* Account Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                    <div>
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Wishlist Items</p>
                      <p className="text-3xl font-bold text-gray-900">{wishlist.length}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {loading ? (
                  <Card className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  </Card>
                ) : orders.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Button onClick={() => router.push("/collections/all")}>
                      Start Shopping
                    </Button>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <Badge className={statusColors[order.status] || ""}>
                          {order.status}
                        </Badge>
                      </div>

                      {order.estimatedDeliveryDate && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-700">Est. Delivery</p>
                          <p className="font-semibold text-green-900">
                            {formatDate(order.estimatedDeliveryDate)}
                          </p>
                        </div>
                      )}

                      <div className="mb-4 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(Number(item.price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            router.push(`/track-order?orderId=${order.id}`)
                          }
                          variant="outline"
                        >
                          Track Order
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-4">
                {wishlist.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                    <Button onClick={() => router.push("/collections/all")}>
                      Add Items to Wishlist
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((product) => {
                      const firstImage = product.images?.split(",")[0] || "";
                      const discountedPrice = product.discount
                        ? Number(product.price) * (1 - product.discount / 100)
                        : Number(product.price);

                      return (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                          <div className="relative">
                            {firstImage && (
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            {product.discount && (
                              <Badge className="absolute top-3 right-3 bg-red-500">
                                -{product.discount}%
                              </Badge>
                            )}
                          </div>

                          <div className="p-4">
                            {product.category && (
                              <p className="text-xs text-gray-600 mb-1">
                                {product.category.name}
                              </p>
                            )}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between mb-4">
                              <div>
                                {product.discount ? (
                                  <>
                                    <p className="text-lg font-bold text-gray-900">
                                      {formatCurrency(discountedPrice)}
                                    </p>
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatCurrency(Number(product.price))}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(Number(product.price))}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Button
                                onClick={() => router.push(`/product/${product.slug}`)}
                                className="w-full"
                              >
                                View Product
                              </Button>
                              <Button
                                onClick={() => removeFromWishlist(product.id)}
                                disabled={removingWishlistId === product.id}
                                variant="outline"
                                className="w-full text-red-600 hover:text-red-700"
                              >
                                {removingWishlistId === product.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
