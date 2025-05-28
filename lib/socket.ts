"use client";

import { io, Socket } from 'socket.io-client';
import { Location, DeliverySession } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private isInitialized = false;

  initialize(): Socket {
    if (this.isInitialized && this.socket) return this.socket;

    // For this demo, we're mocking the socket connection
    // In a real app, this would connect to your Socket.IO server
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.isInitialized = true;
    return this.socket;
  }

  // Join a room for a specific order
  joinOrderRoom(orderId: string): void {
    if (!this.socket) this.initialize();
    this.socket?.emit('joinRoom', { roomId: `order:${orderId}` });
  }

  // Leave a room
  leaveOrderRoom(orderId: string): void {
    this.socket?.emit('leaveRoom', { roomId: `order:${orderId}` });
  }

  // Send location update
  updateLocation(orderId: string, location: Location): void {
    this.socket?.emit('locationUpdate', { orderId, location });
  }

  // Listen for location updates
  onLocationUpdate(callback: (data: { orderId: string, location: Location }) => void): void {
    this.socket?.on('locationUpdate', callback);
  }

  // Listen for delivery status changes
  onDeliveryStatusChange(callback: (data: { orderId: string, status: string }) => void): void {
    this.socket?.on('deliveryStatusChange', callback);
  }

  // Simulate location updates for demo purposes
  simulateLocationUpdates(orderId: string, startLat: number, startLng: number): () => void {
    const intervalId = setInterval(() => {
      // Generate a small random movement
      const latChange = (Math.random() - 0.5) * 0.001;
      const lngChange = (Math.random() - 0.5) * 0.001;
      
      const location: Location = {
        lat: startLat + latChange,
        lng: startLng + lngChange,
        timestamp: Date.now(),
      };
      
      // Update local state
      console.log('Simulating location update:', location);
      this.updateLocation(orderId, location);
      
      // In a real app, this would also update the backend via API
    }, 3000); // Update every 3 seconds
    
    // Return a cleanup function
    return () => clearInterval(intervalId);
  };

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isInitialized = false;
      this.socket = null;
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();