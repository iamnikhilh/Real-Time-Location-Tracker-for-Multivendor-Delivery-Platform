export type Role = 'vendor' | 'delivery' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Order {
  id: string;
  vendorId: string;
  customerId: string;
  deliveryPartnerId?: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered';
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface DeliverySession {
  orderId: string;
  deliveryPartnerId: string;
  currentLocation?: Location;
  route?: Location[];
  startTime?: number;
  endTime?: number;
}