"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PackageIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowRightIcon,
  AlertCircleIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard-layout';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByDeliveryPartner } from '@/lib/data';
import { Order } from '@/types';

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [orderStats, setOrderStats] = useState({
    assigned: 0,
    inTransit: 0,
    delivered: 0,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const deliveryOrders = getOrdersByDeliveryPartner(currentUser.id);
      setOrders(deliveryOrders);

      // Calculate order statistics
      setOrderStats({
        assigned: deliveryOrders.filter(order => order.status === 'assigned').length,
        inTransit: deliveryOrders.filter(order => order.status === 'in_transit').length,
        delivered: deliveryOrders.filter(order => order.status === 'delivered').length,
      });
    }
  }, []);

  // Get most recent orders
  const recentOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  // Get active delivery (in_transit orders)
  const activeDeliveries = orders.filter(order => order.status === 'in_transit');

  return (
    <DashboardLayout role="delivery">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Partner'}
          </p>
        </div>

        {/* Dashboard stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Assigned Orders */}
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Assigned Orders
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
        {activeDeliveries.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Deliveries</h2>
              <Link href="/dashboard/delivery/active">
                <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                  View Active Delivery
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeDeliveries.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Order {order.id}</CardTitle>
                      <StatusBadge status={order.status} />
                    </div>
                    <CardDescription>Pickup from: {order.pickupAddress}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm"><span className="font-medium">Deliver to:</span> {order.deliveryAddress}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(order.updatedAt).toLocaleString()}
                    </div>
                    <Link href={`/dashboard/delivery/active?id=${order.id}`}>
                      <Button variant="outline" size="sm">
                        Continue <ArrowRightIcon className="ml-1 h-4 w-4" />
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
            <Link href="/dashboard/delivery/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Pickup Address</th>
                    <th className="py-3 px-4 text-left">Delivery Address</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Updated</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{order.id}</td>
                        <td className="py-3 px-4 text-sm truncate max-w-[150px]">
                          {order.pickupAddress}
                        </td>
                        <td className="py-3 px-4 text-sm truncate max-w-[150px]">
                          {order.deliveryAddress}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {order.status === 'assigned' ? (
                            <Link href={`/dashboard/delivery/active?id=${order.id}`}>
                              <Button size="sm">
                                Start Delivery
                              </Button>
                            </Link>
                          ) : order.status === 'in_transit' ? (
                            <Link href={`/dashboard/delivery/active?id=${order.id}`}>
                              <Button variant="outline" size="sm">
                                Continue
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/delivery/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                        No orders assigned yet
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