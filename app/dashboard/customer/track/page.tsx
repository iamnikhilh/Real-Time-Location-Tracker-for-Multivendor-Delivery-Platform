"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPinIcon, 
  Clock3Icon,
  PackageIcon,
  PhoneIcon,
  MessageSquareIcon,
  ShareIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard-layout';
import MapComponent from '@/components/map-component';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById, getDeliverySession } from '@/lib/data';
import { socketService } from '@/lib/socket';
import { Order, DeliverySession, Location } from '@/types';

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orderId = searchParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [deliverySession, setDeliverySession] = useState<DeliverySession | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [updateTime, setUpdateTime] = useState<string>('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (orderId) {
      const orderData = getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        
        // Check if there's an active delivery session
        const session = getDeliverySession(orderId);
        if (session) {
          setDeliverySession(session);
          setCurrentLocation(session.currentLocation || null);
          
          // Calculate progress and estimated time
          if (session.startTime) {
            const now = Date.now();
            const elapsed = now - session.startTime;
            
            // Assuming a delivery takes around 30 minutes
            const estimatedTotalTime = 30 * 60 * 1000; 
            const remaining = Math.max(0, estimatedTotalTime - elapsed);
            const minutes = Math.floor(remaining / (60 * 1000));
            
            setEstimatedTime(`${minutes} min`);
            setProgress(Math.min(100, (elapsed / estimatedTotalTime) * 100));
            
            // Set update time
            if (session.currentLocation) {
              const lastUpdate = new Date(session.currentLocation.timestamp);
              setUpdateTime(lastUpdate.toLocaleTimeString());
            }
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'No active delivery',
            description: 'This order is not currently being delivered.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Order not found',
          description: 'The requested order could not be found.',
        });
        router.replace('/dashboard/customer');
      }
    }

    // Initialize socket connection
    const socket = socketService.initialize();
    
    // Join the order room
    if (orderId) {
      socketService.joinOrderRoom(orderId);
      
      // Listen for location updates
      socketService.onLocationUpdate((data) => {
        if (data.orderId === orderId) {
          setCurrentLocation(data.location);
          setUpdateTime(new Date(data.location.timestamp).toLocaleTimeString());
        }
      });
      
      // Listen for delivery status changes
      socketService.onDeliveryStatusChange((data) => {
        if (data.orderId === orderId) {
          // Refresh order data
          const updatedOrder = getOrderById(orderId);
          if (updatedOrder) {
            setOrder(updatedOrder);
            
            if (updatedOrder.status === 'delivered') {
              toast({
                title: 'Delivery completed',
                description: 'Your order has been delivered!',
              });
              
              // Redirect to orders page after a delay
              setTimeout(() => {
                router.replace('/dashboard/customer/orders');
              }, 3000);
            }
          }
        }
      });
    }

    return () => {
      // Leave the order room and disconnect socket
      if (orderId) {
        socketService.leaveOrderRoom(orderId);
      }
    };
  }, [orderId, router, toast]);

  const shareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Track My Delivery',
        text: `Track my delivery in real-time`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link copied',
          description: 'Tracking link copied to clipboard',
        });
      });
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Track Your Order</h1>
          {order && (
            <p className="text-muted-foreground">
              Order ID: {order.id}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Map Section */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Live Tracking</CardTitle>
                  <CardDescription>
                    Last updated: {updateTime || 'Waiting for update...'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={shareTracking}>
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent 
                  deliverySession={deliverySession}
                  initialLocation={currentLocation || undefined}
                  className="h-[400px] md:h-[500px] rounded-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            {/* Delivery Status */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order && (
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={
                        order.status === 'delivered' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : order.status === 'in_transit'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }
                    >
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {estimatedTime ? `ETA: ${estimatedTime}` : ''}
                    </span>
                  </div>
                )}
                
                {order?.status === 'in_transit' && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Pickup</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                      <p className="mt-1">{order.deliveryAddress}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Order Placed</h3>
                      <p className="mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Delivery Partner */}
            {order?.status === 'in_transit' && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-indigo-100 text-indigo-800">DP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Delivery Partner</p>
                      <p className="text-xs text-gray-500">ID: {order.deliveryPartnerId}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <PhoneIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MessageSquareIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}