"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PackageIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard-layout';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByVendor, getAvailableDeliveryPartners, assignDeliveryPartner } from '@/lib/data';
import { Order, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function VendorOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [deliveryPartners, setDeliveryPartners] = useState<User[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const vendorOrders = getOrdersByVendor(currentUser.id);
      setOrders(vendorOrders);
      
      // Get available delivery partners
      const partners = getAvailableDeliveryPartners();
      setDeliveryPartners(partners);
    }
  }, []);

  const handleAssignPartner = (orderId: string, partnerId: string) => {
    const updatedOrder = assignDeliveryPartner(orderId, partnerId);
    if (updatedOrder) {
      // Update orders list
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      toast({
        title: 'Delivery partner assigned',
        description: 'The order has been assigned successfully.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Assignment failed',
        description: 'Failed to assign delivery partner. Please try again.',
      });
    }
  };

  return (
    <DashboardLayout role="vendor">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
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
                      <td className="py-3 px-4 text-sm">Customer {order.customerId}</td>
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
                        {order.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <select
                              className="text-sm border rounded px-2 py-1"
                              value={selectedPartner || ''}
                              onChange={(e) => setSelectedPartner(e.target.value)}
                            >
                              <option value="">Select Partner</option>
                              {deliveryPartners.map(partner => (
                                <option key={partner.id} value={partner.id}>
                                  {partner.name}
                                </option>
                              ))}
                            </select>
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (selectedPartner) {
                                  handleAssignPartner(order.id, selectedPartner);
                                }
                              }}
                              disabled={!selectedPartner}
                            >
                              Assign
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                      No orders found
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
      icon = <PackageIcon className="h-3.5 w-3.5 mr-1" />;
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