'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'ON_THE_WAY', label: 'On The Way' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  address: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    email: string;
    name?: string;
  };
}

interface AdminOrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [error, setError] = useState('');

  // Fetch order on mount
  const [orderFetched, setOrderFetched] = useState(false);

  if (!orderFetched) {
    setOrderFetched(true);
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status);
        if (data.estimatedDeliveryDate) {
          setEstimatedDate(
            new Date(data.estimatedDeliveryDate).toISOString().split('T')[0]
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load order');
        setLoading(false);
      });
  }

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      setError('');

      const response = await fetch(`/api/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          estimatedDeliveryDate: estimatedDate
            ? new Date(estimatedDate).toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert('Order status updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  let address = { name: 'Guest', email: '', phone: '', address: '', city: '' };
  try {
    address = JSON.parse(order.address);
  } catch {}

  const imageUrl = order.items[0]?.product.images.split(',')[0] || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Update */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-secondary/5"
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="h-20 w-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      ₹{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4">Order Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className={statusColors[order.status] || ''}>
                  {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                </Badge>
              </div>
              {order.estimatedDeliveryDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Est. Delivery
                  </p>
                  <p className="font-medium">
                    {new Date(
                      order.estimatedDeliveryDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold mb-4">Customer Info</h3>
            <div className="space-y-2 text-sm">
              {address.name && <p className="font-medium">{address.name}</p>}
              {address.email && (
                <p className="text-muted-foreground break-words">{address.email}</p>
              )}
              {order.user?.email && !address.email && (
                <p className="text-muted-foreground break-words">
                  {order.user.email}
                </p>
              )}
              {address.phone && (
                <p className="text-muted-foreground">{address.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border p-6 col-span-full lg:col-span-1">
            <h3 className="font-bold mb-4">Shipping Address</h3>
            <div className="space-y-3 text-sm">
              {address.address && (
                <div>
                  <p className="text-muted-foreground mb-1">Address</p>
                  <p className="break-words whitespace-normal font-medium">{address.address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {address.city && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">City</p>
                    <p className="font-medium">{address.city}</p>
                  </div>
                )}
                {address.state && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">State</p>
                    <p className="font-medium">{address.state}</p>
                  </div>
                )}
                {address.pincode && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Pin Code</p>
                    <p className="font-medium">{address.pincode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-3xl font-bold">
              ₹{Number(order.total).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
