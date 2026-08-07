export interface ServiceItem {
  id: string;
  name: string;
  category: 'wash' | 'iron' | 'dry_clean' | 'shoes' | 'heavy' | 'special';
  description: string;
  price: number;
  unit: string; // 'kg' | 'item' | 'pair' | 'sq meter'
  iconName: string;
  estimatedTime: string;
  popular?: boolean;
}

export interface CartItem {
  service: ServiceItem;
  quantity: number;
}

export interface PickupDetails {
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  address: string;
  buildingNotes?: string;
  contactPhone: string;
  expressDelivery: boolean;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Mobile Wallet';
}

export type OrderStatus = 
  | 'Order Placed' 
  | 'Picked Up' 
  | 'In Washing' 
  | 'Ironing & Folding' 
  | 'Out for Delivery' 
  | 'Delivered';

export interface FirebaseConnectionStatus {
  tested: boolean;
  connected: boolean;
  message: string;
  source: 'server' | 'cache' | 'mock';
  timestamp?: string;
  projectId?: string;
  error?: string;
  googleServicesFound: boolean;
}
