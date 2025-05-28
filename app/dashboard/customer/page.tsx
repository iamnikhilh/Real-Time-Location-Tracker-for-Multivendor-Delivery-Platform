"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PackageIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  SearchIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/dashboard-layout';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByCustomer } from '@/lib/data';
import { Order } from '@/types';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    assigned: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const customerOrders = getOrdersByCustomer(currentUser.id);
      setOrders(customerOrders);

      // Calculate order statistics
      setOrderStats({
        pending: customerOrders.filter(order => order.status === 'pending').length,
        assigned: customerOrders.filter(order => order.status === 'assigned').length,
        inTransit: customerOrders.filter(order => order.status === 'in_transit').length,
        delivered: customerOrders.filter(order => order.status === 'delivered').length,
      });
    }
  }, []);

  // Get active orders (in_transit)
  const activeOrders = orders.filter(order => order.status === 'in_transit');
  
  // Get recent orders
  const recentOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId) {
      window.location.href = `/dashboard/customer/track?id=${trackingId}`;
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Customer'}
          </p>
        </div>

        {/* Track Order Box */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Track Your Order</CardTitle>
              <CardDescription>
                Enter your order ID to track your delivery in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="flex space-x-2">
                <Input
                  placeholder="Enter order ID (e.g., ord-1)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {/* Pending Orders */}
          <Card className="bg-orange-50 border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-900">{orderStats.pending}</div>
                <ClockIcon className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Orders */}
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-900">{orderStats.assigned}</div>
                <PackageIcon className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* In Transit */}
          <Card className="bg-indigo-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">
                In Transit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-indigo-900">{orderStats.inTransit}</div>
                <MapPinIcon className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          {/* Delivered Orders */}
          <Card className="bg-green-50 border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-900">{orderStats.delivered}</div>
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Deliveries */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Deliveries</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Order {order.id}</CardTitle>
                      <StatusBadge status={order.status} />
                    </div>
                    <CardDescription>Delivery to: {order.deliveryAddress}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(order.updatedAt).toLocaleString()}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link href={`/dashboard/customer/track?id=${order.id}`} className="w-full">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Track Live Location
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/dashboard/customer/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Delivery Address</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Created</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{order.id}</td>
                        <td className="py-3 px-4 text-sm truncate max-w-[200px]">
                          {order.deliveryAddress}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {order.status === 'in_transit' ? (
                            <Link href={`/dashboard/customer/track?id=${order.id}`}>
                              <Button size="sm">
                                Track
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/customer/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Status badge component
function StatusBadge({ status }: { status: Order['status'] }) {
  let bgColor, textColor, icon;

  switch (status) {
    case 'pending':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      icon = <ClockIcon className="h-3.5 w-3.5 mr-1" />;
      break;
    case 'assigned':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <PackageIcon className="h-3.5 w-3.5 mr-1" />;
      break;
    case 'in_transit':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      icon = <MapPinIcon className="h-3.5 w-3.5 mr-1" />;
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = <AlertCircleIcon className="h-3.5 w-3.5 mr-1" />;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}