"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPinIcon, CheckCircleIcon, PlayIcon, PauseIcon, HopIcon as StopIcon, LocateIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard-layout';
import MapComponent from '@/components/map-component';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById, startDelivery, updateDeliveryLocation, completeDelivery, getDeliverySession } from '@/lib/data';
import { socketService } from '@/lib/socket';
import { Order, DeliverySession, Location } from '@/types';

export default function ActiveDeliveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orderId = searchParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [deliverySession, setDeliverySession] = useState<DeliverySession | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser || currentUser.role !== 'delivery') {
      router.replace('/login');
      return;
    }

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
            setElapsedTime(elapsed);
            
            // Assuming a delivery takes around 30 minutes
            const estimatedTotalTime = 30 * 60 * 1000; 
            setEstimatedTime(estimatedTotalTime);
            
            const calculatedProgress = Math.min(100, (elapsed / estimatedTotalTime) * 100);
            setProgress(calculatedProgress);
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Order not found',
          description: 'The requested order could not be found.',
        });
        router.replace('/dashboard/delivery');
      }
    }

    // Initialize socket connection
    socketService.initialize();

    return () => {
      // Cleanup simulation and socket connection
      if (isSimulating) {
        stopSimulation();
      }
    };
  }, [orderId, router, toast]);

  const startSimulation = () => {
    if (!orderId || !user) return;
    
    // Start delivery if not already started
    if (!deliverySession) {
      const newSession = startDelivery(orderId, user.id);
      setDeliverySession(newSession);
      setCurrentLocation(newSession.currentLocation || null);
      setIsSimulating(true);
      
      toast({
        title: 'Delivery started',
        description: 'You are now in transit with this order.',
      });
      
      // Set start time and estimated time
      const now = Date.now();
      setElapsedTime(0);
      setEstimatedTime(30 * 60 * 1000); // 30 minutes
      
      // Join socket room for this order
      socketService.joinOrderRoom(orderId);
      
      // Start location simulation
      const startLat = 40.7128; // New York coordinates as example
      const startLng = -74.006;
      
      const cleanupFn = socketService.simulateLocationUpdates(orderId, startLat, startLng);
      
      // Set up interval to update progress
      const progressInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - now;
        setElapsedTime(elapsed);
        
        const calculatedProgress = Math.min(100, (elapsed / (30 * 60 * 1000)) * 100);
        setProgress(calculatedProgress);
        
        // Listen for location updates
        socketService.onLocationUpdate((data) => {
          if (data.orderId === orderId) {
            setCurrentLocation(data.location);
            updateDeliveryLocation(orderId, data.location);
          }
        });
      }, 1000);
      
      return () => {
        clearInterval(progressInterval);
        cleanupFn();
      };
    } else {
      // Resume existing simulation
      setIsSimulating(true);
      
      // Start location simulation
      const startLat = currentLocation?.lat || 40.7128;
      const startLng = currentLocation?.lng || -74.006;
      
      const cleanupFn = socketService.simulateLocationUpdates(orderId, startLat, startLng);
      
      return () => {
        cleanupFn();
      };
    }
  };

  const pauseSimulation = () => {
    setIsSimulating(false);
  };

  const stopSimulation = () => {
    if (!orderId) return;
    
    setIsSimulating(false);
    
    // Complete the delivery
    completeDelivery(orderId);
    
    toast({
      title: 'Delivery completed',
      description: 'This order has been marked as delivered.',
    });
    
    // Leave socket room
    socketService.leaveOrderRoom(orderId);
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
      router.replace('/dashboard/delivery');
    }, 2000);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <DashboardLayout role="delivery">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Active Delivery</h1>
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
              <CardHeader>
                <CardTitle>Live Location Tracking</CardTitle>
                <CardDescription>
                  {isSimulating ? 'Your location is being shared with the customer' : 'Start delivery to share your location'}
                </CardDescription>
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

          {/* Delivery Info and Controls */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Pickup Address</h3>
                      <p className="mt-1">{order.pickupAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                      <p className="mt-1">{order.deliveryAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Delivery Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Elapsed: {formatTime(elapsedTime)}</span>
                  <span className="text-gray-500">
                    ETA: {formatTime(Math.max(0, estimatedTime - elapsedTime))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {!isSimulating ? (
                    <Button 
                      onClick={startSimulation} 
                      className="col-span-3 bg-green-600 hover:bg-green-700"
                    >
                      <PlayIcon className="mr-2 h-4 w-4" />
                      {deliverySession ? 'Resume Delivery' : 'Start Delivery'}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={pauseSimulation} 
                        variant="outline"
                        className="col-span-1"
                      >
                        <PauseIcon className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                      <Button 
                        onClick={stopSimulation} 
                        className="col-span-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Complete Delivery
                      </Button>
                    </>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!isSimulating}
                >
                  <LocateIcon className="mr-2 h-4 w-4" />
                  Get Current Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}