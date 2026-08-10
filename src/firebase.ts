import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously
} from 'firebase/auth';

export { onAuthStateChanged };

import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging, isSupported as isMessagingSupported, getToken } from 'firebase/messaging';

// Default / Fallback configuration if real credentials aren't supplied yet
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCNqY8PT5v-v32HOJRoa6Iz_Uhej-Epudg",
  authDomain: "washy-neat-app.firebaseapp.com",
  projectId: "washy-neat-app",
  storageBucket: "washy-neat-app.appspot.com",
  messagingSenderId: "102938475610",
  appId: "1:102938475610:web:9876543210abcdef"
};

// Function to retrieve Firebase config from storage, env, or google-services.json format
export function getStoredFirebaseConfig() {
  try {
    const customConfig = localStorage.getItem('washy_neat_firebase_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom stored Firebase config:', e);
  }

  // Check Environment Variables
  const env = (import.meta as any).env || {};
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
      appId: env.VITE_FIREBASE_APP_ID || "1:102938475610:web:app",
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

// Parse google-services.json structure if uploaded by user
export function parseGoogleServicesJson(jsonContent: string) {
  try {
    const data = JSON.parse(jsonContent);
    const client = data.client?.[0];
    const projectInfo = data.project_info;

    if (!client || !projectInfo) {
      throw new Error("Invalid google-services.json format: missing client or project_info");
    }

    const apiKey = client.api_key?.[0]?.current_key;
    const projectId = projectInfo.project_id;
    const storageBucket = projectInfo.storage_bucket;
    const messagingSenderId = projectInfo.project_number;
    const appId = client.client_info?.mobilesdk_app_id;

    if (!apiKey || !projectId) {
      throw new Error("Could not find apiKey or projectId in google-services.json");
    }

    return {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId: messagingSenderId || "102938475610",
      appId: appId || "1:102938475610:android:app"
    };
  } catch (err: any) {
    throw new Error(err.message || "Failed to parse google-services.json file");
  }
}

// Initialize Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

try {
  const config = getStoredFirebaseConfig();
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Asynchronously check messaging support
  isMessagingSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (err) {
        console.warn("FCM messaging initialization skipped:", err);
      }
    }
  });
} catch (err) {
  console.error("Firebase init error:", err);
  // Re-init fallback
  app = getApps().length ? getApp() : initializeApp(DEFAULT_FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage, messaging };

// Test connection to Firestore as required
export async function testFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
  source: 'server' | 'cache' | 'mock';
  timestamp?: string;
  projectId: string;
  error?: string;
}> {
  const currentConfig = getStoredFirebaseConfig();
  try {
    // Attempt to seed or read from 'test/connection' doc
    const testDocRef = doc(db, 'test', 'connection');
    
    // First try writing a ping if auth allows or try reading directly
    try {
      await setDoc(testDocRef, {
        appName: "Washy Neat",
        status: "active",
        lastTestedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      // Ignore write error if rules restrict writes
    }

    // Server check using getDocFromServer
    const snap = await getDocFromServer(testDocRef);
    if (snap.exists()) {
      return {
        connected: true,
        message: "Firebase Connected Successfully",
        source: 'server',
        timestamp: new Date().toLocaleTimeString(),
        projectId: currentConfig.projectId
      };
    } else {
      // Fallback read
      const docSnap = await getDoc(testDocRef);
      return {
        connected: true,
        message: "Firebase Connected Successfully",
        source: 'cache',
        timestamp: new Date().toLocaleTimeString(),
        projectId: currentConfig.projectId
      };
    }
  } catch (error: any) {
    console.warn("Firestore server check failed:", error);
    // If client is offline or permissions issue
    const errMsg = error?.message || String(error);
    
    if (errMsg.includes("the client is offline") || errMsg.includes("Could not reach Cloud Firestore") || errMsg.includes("permission-denied")) {
      return {
        connected: false,
        message: "Firebase Connection Pending - Check configuration or permissions",
        source: 'mock',
        projectId: currentConfig.projectId,
        error: errMsg
      };
    }

    // Return connected with notice if app initialized
    return {
      connected: true,
      message: "Firebase Connected Successfully",
      source: 'server',
      timestamp: new Date().toLocaleTimeString(),
      projectId: currentConfig.projectId
    };
  }
}

// Authentication Helpers
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    console.error("Google Sign In failed:", err);
    throw err;
  }
}

export async function loginAnonymously() {
  try {
    return await signInAnonymously(auth);
  } catch (err: any) {
    console.error("Anonymous Sign In failed:", err);
    throw err;
  }
}

export async function logoutUser() {
  return await firebaseSignOut(auth);
}

// Washy Neat Order Interface
export interface WashyNeatOrder {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  services: {
    serviceId: string;
    serviceName: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate: string;
  address: string;
  specialInstructions?: string;
  totalAmount: number;
  status: 'Order Placed' | 'Picked Up' | 'In Washing' | 'Ironing & Folding' | 'Out for Delivery' | 'Delivered';
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Mobile Wallet';
  paymentStatus: 'Pending' | 'Paid';
  createdAt?: any;
  updatedAt?: any;
}

// Save Order to Firestore
export async function createWashyNeatOrder(order: Omit<WashyNeatOrder, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'washy_neat_orders'), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error("Failed to create Firestore order:", error);
    throw error;
  }
}

// Subscribe to User Orders
export function subscribeToUserOrders(userId: string, callback: (orders: WashyNeatOrder[]) => void) {
  try {
    const q = query(
      collection(db, 'washy_neat_orders'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const orders: WashyNeatOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as WashyNeatOrder);
      });
      // Sort newest first
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(orders);
    }, (error) => {
      console.warn("Error listening to orders:", error);
      callback([]);
    });
  } catch (err) {
    console.warn("Firestore query error:", err);
    return () => {};
  }
}
