"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Trash2, Mail } from "lucide-react";

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

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  clerkId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  orders: Order[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/customers/${customerId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch customer");
        }

        const data: Customer = await response.json();
        setCustomer(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load customer"
        );
        router.push("/admin/customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, router]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast.success("Customer deleted successfully");
      router.push("/admin/customers");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete customer"
      );
    } finally {
      setDeleting(false);
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
      month: "long",
      day: "numeric",
    });
  };

  const calculateStats = () => {
    if (!customer || !customer.orders) {
      return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
    }

    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return { totalOrders, totalSpent, averageOrderValue };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500">Customer not found</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {customer.name || "Unnamed Customer"}
              </h1>
              <p className="text-gray-600 mt-1">{customer.email}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Customer
          </Button>
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDate(customer.createdAt)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalSpent)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.averageOrderValue)}
            </p>
          </Card>
        </div>

        {/* Order History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order History
          </h2>

          {customer.orders.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <p>No orders yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((order) => {
                let parsedAddress = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };
                try {
                  parsedAddress = JSON.parse(order.address || '{}');
                } catch {}

                return (
                <Card key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <Badge
                        className="mt-2"
                        variant={
                          order.status === "DELIVERED"
                            ? "default"
                            : order.status === "PENDING"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm text-gray-600"
                        >
                          <span>
                            {item.product.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="pt-4 border-t space-y-4">
                    <div>
                      <p className="text-gray-600 font-semibold mb-2">Delivery Address</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {parsedAddress.name && (
                          <div>
                            <p className="text-gray-600 text-xs">Name</p>
                            <p className="text-gray-900 font-medium">{parsedAddress.name}</p>
                          </div>
                        )}
                        {parsedAddress.email && (
                          <div>
                            <p className="text-gray-600 text-xs">Email</p>
                            <p className="text-gray-900 font-medium break-words">{parsedAddress.email}</p>
                          </div>
                        )}
                        {parsedAddress.phone && (
                          <div>
                            <p className="text-gray-600 text-xs">Phone</p>
                            <p className="text-gray-900 font-medium">{parsedAddress.phone}</p>
                          </div>
                        )}
                        {parsedAddress.address && (
                          <div className="col-span-2">
                            <p className="text-gray-600 text-xs">Address</p>
                            <p className="text-gray-900 font-medium break-words">{parsedAddress.address}</p>
                          </div>
                        )}
                        {parsedAddress.city && (
                          <div>
                            <p className="text-gray-600 text-xs">City</p>
                            <p className="text-gray-900 font-medium">{parsedAddress.city}</p>
                          </div>
                        )}
                        {parsedAddress.state && (
                          <div>
                            <p className="text-gray-600 text-xs">State</p>
                            <p className="text-gray-900 font-medium">{parsedAddress.state}</p>
                          </div>
                        )}
                        {parsedAddress.pincode && (
                          <div>
                            <p className="text-gray-600 text-xs">Pin Code</p>
                            <p className="text-gray-900 font-medium">{parsedAddress.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Est. Delivery</p>
                      <p className="text-gray-900 font-medium">
                        {order.estimatedDeliveryDate
                          ? formatDate(order.estimatedDeliveryDate)
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                </Card>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
