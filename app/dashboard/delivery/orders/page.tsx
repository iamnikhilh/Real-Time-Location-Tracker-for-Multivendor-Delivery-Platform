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
  TruckIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard-layout';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByDeliveryPartner } from '@/lib/data';
import { Order } from '@/types';

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const deliveryOrders = getOrdersByDeliveryPartner(currentUser.id);
      setOrders(deliveryOrders);
    }
  }, []);

  return (
    <DashboardLayout role="delivery">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">My Deliveries</h1>
          <p className="text-muted-foreground">
            View and manage all your assigned deliveries
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Pickup Address</th>
                  <th className="py-3 px-4 text-left">Delivery Address</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{order.id}</td>
                      <td className="py-3 px-4 text-sm truncate max-w-[200px]">
                        {order.pickupAddress}
                      </td>
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
                          <Button variant="ghost" size="sm" disabled>
                            {order.status === 'delivered' ? 'Completed' : 'Pending'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <PackageIcon className="h-8 w-8 mb-2 text-gray-400" />
                        <p>No orders assigned yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      icon = <TruckIcon className="h-3.5 w-3.5 mr-1" />;
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