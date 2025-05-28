import { Order, User, DeliverySession, Location } from '@/types';

// Mock data for demonstration purposes
// In a real app, this would be replaced with API calls

// Mock orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    vendorId: 'v-1',
    customerId: 'c-1',
    deliveryPartnerId: undefined,
    status: 'pending',
    pickupAddress: '123 Vendor St, New York, NY',
    deliveryAddress: '456 Customer Ave, New York, NY',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-2',
    vendorId: 'v-1',
    customerId: 'c-2',
    deliveryPartnerId: 'd-1',
    status: 'assigned',
    pickupAddress: '789 Vendor Blvd, New York, NY',
    deliveryAddress: '101 Customer Rd, New York, NY',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-3',
    vendorId: 'v-2',
    customerId: 'c-1',
    deliveryPartnerId: 'd-2',
    status: 'in_transit',
    pickupAddress: '321 Shop St, New York, NY',
    deliveryAddress: '456 Customer Ave, New York, NY',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-4',
    vendorId: 'v-1',
    customerId: 'c-3',
    deliveryPartnerId: 'd-1',
    status: 'delivered',
    pickupAddress: '123 Vendor St, New York, NY',
    deliveryAddress: '555 Customer Ct, New York, NY',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock delivery partners
const MOCK_DELIVERY_PARTNERS: User[] = [
  {
    id: 'd-1',
    name: 'John Delivery',
    email: 'john.delivery@example.com',
    role: 'delivery',
  },
  {
    id: 'd-2',
    name: 'Alice Driver',
    email: 'alice.driver@example.com',
    role: 'delivery',
  },
  {
    id: 'd-3',
    name: 'Bob Courier',
    email: 'bob.courier@example.com',
    role: 'delivery',
  },
];

// Mock active delivery sessions
const MOCK_DELIVERY_SESSIONS: Record<string, DeliverySession> = {
  'ord-3': {
    orderId: 'ord-3',
    deliveryPartnerId: 'd-2',
    currentLocation: {
      lat: 40.7128,
      lng: -74.006,
      timestamp: Date.now(),
    },
    route: [
      { lat: 40.7128, lng: -74.006, timestamp: Date.now() - 5 * 60 * 1000 },
      { lat: 40.7138, lng: -74.008, timestamp: Date.now() - 4 * 60 * 1000 },
      { lat: 40.7148, lng: -74.010, timestamp: Date.now() - 3 * 60 * 1000 },
      { lat: 40.7158, lng: -74.012, timestamp: Date.now() - 2 * 60 * 1000 },
      { lat: 40.7168, lng: -74.014, timestamp: Date.now() - 1 * 60 * 1000 },
      { lat: 40.7178, lng: -74.016, timestamp: Date.now() },
    ],
    startTime: Date.now() - 10 * 60 * 1000,
    endTime: undefined,
  },
};

// Functions to interact with the mock data
export const getOrdersByVendor = (vendorId: string): Order[] => {
  return MOCK_ORDERS.filter(order => order.vendorId === vendorId);
};

export const getOrdersByCustomer = (customerId: string): Order[] => {
  return MOCK_ORDERS.filter(order => order.customerId === customerId);
};

export const getOrdersByDeliveryPartner = (deliveryPartnerId: string): Order[] => {
  return MOCK_ORDERS.filter(order => order.deliveryPartnerId === deliveryPartnerId);
};

export const getOrderById = (orderId: string): Order | undefined => {
  return MOCK_ORDERS.find(order => order.id === orderId);
};

export const getAvailableDeliveryPartners = (): User[] => {
  return MOCK_DELIVERY_PARTNERS;
};

export const assignDeliveryPartner = (orderId: string, deliveryPartnerId: string): Order | null => {
  const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return null;
  
  MOCK_ORDERS[orderIndex] = {
    ...MOCK_ORDERS[orderIndex],
    deliveryPartnerId,
    status: 'assigned',
    updatedAt: new Date().toISOString(),
  };
  
  return MOCK_ORDERS[orderIndex];
};

export const startDelivery = (orderId: string, deliveryPartnerId: string): DeliverySession => {
  // Check if there's an existing session
  if (MOCK_DELIVERY_SESSIONS[orderId]) {
    return MOCK_DELIVERY_SESSIONS[orderId];
  }
  
  // Update order status
  const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    MOCK_ORDERS[orderIndex] = {
      ...MOCK_ORDERS[orderIndex],
      status: 'in_transit',
      updatedAt: new Date().toISOString(),
    };
  }
  
  // Create a new delivery session
  const newSession: DeliverySession = {
    orderId,
    deliveryPartnerId,
    currentLocation: {
      lat: 40.7128, // New York coordinates as example
      lng: -74.006,
      timestamp: Date.now(),
    },
    route: [
      { lat: 40.7128, lng: -74.006, timestamp: Date.now() },
    ],
    startTime: Date.now(),
  };
  
  MOCK_DELIVERY_SESSIONS[orderId] = newSession;
  return newSession;
};

export const updateDeliveryLocation = (
  orderId: string, 
  location: Location
): DeliverySession | null => {
  if (!MOCK_DELIVERY_SESSIONS[orderId]) return null;
  
  MOCK_DELIVERY_SESSIONS[orderId] = {
    ...MOCK_DELIVERY_SESSIONS[orderId],
    currentLocation: location,
    route: [...(MOCK_DELIVERY_SESSIONS[orderId].route || []), location],
  };
  
  return MOCK_DELIVERY_SESSIONS[orderId];
};

export const completeDelivery = (orderId: string): Order | null => {
  const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
  if (orderIndex === -1) return null;
  
  // Update order status
  MOCK_ORDERS[orderIndex] = {
    ...MOCK_ORDERS[orderIndex],
    status: 'delivered',
    updatedAt: new Date().toISOString(),
  };
  
  // Update delivery session
  if (MOCK_DELIVERY_SESSIONS[orderId]) {
    MOCK_DELIVERY_SESSIONS[orderId] = {
      ...MOCK_DELIVERY_SESSIONS[orderId],
      endTime: Date.now(),
    };
  }
  
  return MOCK_ORDERS[orderIndex];
};

export const getDeliverySession = (orderId: string): DeliverySession | null => {
  return MOCK_DELIVERY_SESSIONS[orderId] || null;
};