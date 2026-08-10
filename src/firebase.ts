import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { getStorage, FirebaseStorage } from 'firebase/storage';

import {
  getMessaging,
  Messaging,
  isSupported as isMessagingSupported,
} from 'firebase/messaging';


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
//
// These values come from your Firebase project.
//
// Android google-services.json:
//
// project_number:
// 1008039064034
//
// project_id:
// gen-lang-client-0931280678
//
// storage_bucket:
// gen-lang-client-0931280678.firebasestorage.app
//
// mobilesdk_app_id:
// 1:1008039064034:android:9a9b72de8077917986c9bb
//
// api_key:
// AIzaSyCNqY8PT5v-v32HOJRoa6Iz_Uhej-Epudg
//
// DO NOT add a fake authDomain.
// DO NOT use the old washy-neat-app values.
//
// Native Android Google Sign-In is handled by
// @capacitor-firebase/authentication + google-services.json.
//

const firebaseConfig = {
  apiKey: 'AIzaSyCNqY8PT5v-v32HOJRoa6Iz_Uhej-Epudg',
  projectId: 'gen-lang-client-0931280678',
  storageBucket: 'gen-lang-client-0931280678.firebasestorage.app',
  messagingSenderId: '1008039064034',
  appId: '1:1008039064034:android:9a9b72de8077917986c9bb',
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

let messaging: Messaging | null = null;


// ============================================================
// FIREBASE CLOUD MESSAGING
// ============================================================

isMessagingSupported()
  .then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.warn(
          'Firebase Messaging initialization skipped:',
          error
        );
      }
    }
  })
  .catch(() => {
    console.log('Firebase Messaging is not supported on this platform.');
  });


// ============================================================
// EXPORT FIREBASE SERVICES
// ============================================================

export {
  app,
  auth,
  db,
  storage,
  messaging,
  onAuthStateChanged,
};


// ============================================================
// GOOGLE AUTHENTICATION
// ============================================================

export const googleProvider = new GoogleAuthProvider();


// Native Android/iOS Google Sign-In
export async function loginWithGoogle() {
  try {

    // ----------------------------------------------------------
    // NATIVE ANDROID / IOS
    // ----------------------------------------------------------

    if (Capacitor.isNativePlatform()) {

      console.log('Starting native Google Sign-In...');

      const result =
        await FirebaseAuthentication.signInWithGoogle();

      console.log('Native Google Sign-In result:', result);

      if (!result.credential?.idToken) {
        throw new Error(
          'Google Sign-In succeeded but no Google ID token was returned.'
        );
      }

      // Convert Google's native ID token into a Firebase credential
      const credential = GoogleAuthProvider.credential(
        result.credential.idToken
      );

      // Sign that credential into the Firebase JS Auth instance
      const firebaseResult =
        await signInWithCredential(auth, credential);

      console.log(
        'Firebase authentication successful:',
        firebaseResult.user.uid
      );

      return firebaseResult;
    }


    // ----------------------------------------------------------
    // WEB ONLY
    // ----------------------------------------------------------
    //
    // This is only used when running the Vite application
    // in a browser.
    //
    // The Android APK DOES NOT use this path.
    //

    return await signInWithPopup(
      auth,
      googleProvider
    );

  } catch (error: any) {

    console.error(
      'Google Sign-In failed:',
      error
    );

    console.error(
      'Error code:',
      error?.code
    );

    console.error(
      'Error message:',
      error?.message
    );

    throw error;
  }
}


// ============================================================
// ANONYMOUS AUTHENTICATION
// ============================================================

export async function loginAnonymously() {
  try {
    return await signInAnonymously(auth);
  } catch (error: any) {
    console.error(
      'Anonymous Sign-In failed:',
      error
    );

    throw error;
  }
}


// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {
  try {

    // Sign out of native Google/Firebase Authentication plugin
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
      } catch (error) {
        console.warn(
          'Native Firebase sign-out warning:',
          error
        );
      }
    }

    // Sign out of Firebase JS SDK
    await firebaseSignOut(auth);

  } catch (error: any) {

    console.error(
      'Logout failed:',
      error
    );

    throw error;
  }
}


// ============================================================
// TEST FIREBASE CONNECTION
// ============================================================

export async function testFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
  source: 'server' | 'cache' | 'mock';
  timestamp?: string;
  projectId: string;
  error?: string;
}> {

  try {

    const testDocRef = doc(
      db,
      'test',
      'connection'
    );

    try {

      await setDoc(
        testDocRef,
        {
          appName: 'Washy Neat',
          status: 'active',
          lastTestedAt: new Date().toISOString(),
        },
        {
          merge: true,
        }
      );

    } catch (writeError) {

      console.warn(
        'Firebase test write failed:',
        writeError
      );

    }


    const snap =
      await getDocFromServer(testDocRef);


    if (snap.exists()) {

      return {
        connected: true,
        message: 'Firebase Connected Successfully',
        source: 'server',
        timestamp: new Date().toLocaleTimeString(),
        projectId: firebaseConfig.projectId,
      };

    }


    const cachedSnap =
      await getDoc(testDocRef);

    return {
      connected: true,
      message: 'Firebase Connected Successfully',
      source: cachedSnap.exists()
        ? 'cache'
        : 'server',
      timestamp: new Date().toLocaleTimeString(),
      projectId: firebaseConfig.projectId,
    };

  } catch (error: any) {

    console.error(
      'Firebase connection test failed:',
      error
    );

    return {
      connected: false,
      message: 'Firebase Connection Failed',
      source: 'mock',
      projectId: firebaseConfig.projectId,
      error: error?.message || String(error),
    };
  }
}


// ============================================================
// WASHY NEAT ORDER
// ============================================================

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

  status:
    | 'Order Placed'
    | 'Picked Up'
    | 'In Washing'
    | 'Ironing & Folding'
    | 'Out for Delivery'
    | 'Delivered';

  paymentMethod:
    | 'Cash on Delivery'
    | 'Card'
    | 'Mobile Wallet';

  paymentStatus:
    | 'Pending'
    | 'Paid';

  createdAt?: any;

  updatedAt?: any;
}


// ============================================================
// CREATE ORDER
// ============================================================

export async function createWashyNeatOrder(
  order: Omit<WashyNeatOrder, 'id'>
) {

  try {

    const docRef = await addDoc(
      collection(db, 'washy_neat_orders'),
      {
        ...order,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      }
    );

    return {
      id: docRef.id,
      ...order,
    };

  } catch (error) {

    console.error(
      'Failed to create Firestore order:',
      error
    );

    throw error;
  }
}


// ============================================================
// SUBSCRIBE TO USER ORDERS
// ============================================================

export function subscribeToUserOrders(
  userId: string,
  callback: (orders: WashyNeatOrder[]) => void
) {

  try {

    const q = query(
      collection(db, 'washy_neat_orders'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,

      (snapshot) => {

        const orders: WashyNeatOrder[] = [];

        snapshot.forEach((docSnap) => {

          orders.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as WashyNeatOrder);

        });


        // Newest first
        orders.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );


        callback(orders);
      },

      (error) => {

        console.warn(
          'Error listening to orders:',
          error
        );

        callback([]);
      }
    );

  } catch (error) {

    console.warn(
      'Firestore query error:',
      error
    );

    return () => {};
  }
}
