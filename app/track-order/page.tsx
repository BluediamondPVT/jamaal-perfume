'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

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

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  ON_THE_WAY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusSteps = [
  { value: 'PENDING', label: 'Order Placed', icon: '📦' },
  { value: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
  { value: 'PROCESSING', label: 'Processing', icon: '⚙️' },
  { value: 'ON_THE_WAY', label: 'On The Way', icon: '🚚' },
  { value: 'DELIVERED', label: 'Delivered', icon: '✅' },
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Check for orderId in URL params on mount
  useEffect(() => {
    const paramOrderId = searchParams?.get('orderId');
    if (paramOrderId) {
      setOrderId(paramOrderId);
      fetchOrder(paramOrderId);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const searchToast = toast.loading('Searching for your order...');

      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        toast.dismiss(searchToast);
        toast.error('Order not found! Please check the order ID.');
        throw new Error('Order not found');
      }

      const data = await response.json();
      toast.dismiss(searchToast);
      toast.success('Order found! 📦');
      setOrder(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMsg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      setError('Please enter an order ID');
      return;
    }

    await fetchOrder(orderId);
  };

  const getStepStatus = (stepValue: string) => {
    const statusIndex = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'ON_THE_WAY',
      'DELIVERED',
    ].indexOf(stepValue);
    const currentIndex = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'ON_THE_WAY',
      'DELIVERED',
    ].indexOf(order?.status || '');
    return statusIndex <= currentIndex ? 'completed' : 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground text-lg">
            Enter your order ID to track the status of your purchase
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Order ID (e.g., abc123...)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Track'
              )}
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              {searched && !order && (
                <p className="text-sm text-red-700 mt-1">
                  Please check the order ID and try again
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Status Timeline */}
            <div className="bg-white rounded-xl border p-8">
              <h2 className="text-2xl font-bold mb-8">Order Status</h2>

              {/* Status Badge */}
              <div className="mb-8">
                <Badge className={statusColors[order.status] || ''}>
                  {order.status}
                </Badge>
                {order.estimatedDeliveryDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated Delivery:{' '}
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                      'en-IN',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="relative">
                {statusSteps.map((step, index) => {
                  const status = getStepStatus(step.value);
                  const isCompleted = status === 'completed';
                  const isCurrent = order.status === step.value;

                  return (
                    <div key={step.value} className="flex mb-8">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                            isCompleted
                              ? 'bg-green-100 text-green-700'
                              : isCurrent
                                ? 'bg-primary text-white ring-4 ring-primary/20'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step.icon}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`w-1 h-12 mt-2 ${
                              isCompleted ? 'bg-green-200' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="ml-6 pb-4">
                        <h3
                          className={`font-semibold text-lg ${
                            isCompleted || isCurrent
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </h3>
                        {isCurrent && order.status !== 'DELIVERED' && (
                          <p className="text-sm text-primary font-medium mt-1">
                            Current Status
                          </p>
                        )}
                        {isCompleted && order.status !== step.value && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border p-8">
              <h2 className="text-2xl font-bold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const imageUrl = item.product.images.split(',')[0] || '';
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-secondary/5 transition"
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="h-24 w-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-primary mt-2">
                          ₹{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-lg mb-4">Delivery Address</h3>
                <div className="space-y-2 text-sm">
                  {(() => {
                    try {
                      const addr = JSON.parse(order.address);
                      return (
                        <>
                          {addr.name && <p className="font-semibold">{addr.name}</p>}
                          {addr.address && <p>{addr.address}</p>}
                          {addr.city && (
                            <p>
                              {addr.city}
                              {addr.state ? `, ${addr.state}` : ''}
                              {addr.pincode ? ` ${addr.pincode}` : ''}
                            </p>
                          )}
                          {addr.phone && <p>Phone: {addr.phone}</p>}
                        </>
                      );
                    } catch {
                      return <p className="text-muted-foreground">No address found</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Order Total */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-bold text-lg mb-4">Order Total</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{Number(order.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <div className="text-center">
              <Link href="/">
                <Button variant="outline" className="px-8">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && searched && !error && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-muted-foreground">No order found. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
