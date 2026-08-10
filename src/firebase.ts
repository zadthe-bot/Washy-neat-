import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp,
} from "firebase/app";

import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";

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
} from "firebase/firestore";

import {
  getStorage,
  FirebaseStorage,
} from "firebase/storage";

import {
  getMessaging,
  Messaging,
  isSupported as isMessagingSupported,
} from "firebase/messaging";

export { onAuthStateChanged };

/**
 * Firebase configuration
 *
 * These values come from your Firebase project's
 * google-services.json:
 *
 * project_number       -> messagingSenderId
 * project_id           -> projectId
 * storage_bucket       -> storageBucket
 * mobilesdk_app_id     -> appId
 * current_key          -> apiKey
 *
 * Your google-services.json is for an Android app,
 * so it does not contain an authDomain.
 *
 * Native Android Google Sign-In does not require
 * authDomain for this configuration.
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCNqY8PT5v-v32HOJRoa6Iz_Uhej-Epudg",
  projectId: "gen-lang-client-0931280678",
  storageBucket: "gen-lang-client-0931280678.firebasestorage.app",
  messagingSenderId: "1008039064034",
  appId: "1:1008039064034:android:9a9b72de8077917986c9bb",
};

/**
 * Return the Firebase configuration being used.
 */
export function getStoredFirebaseConfig() {
  return FIREBASE_CONFIG;
}

/**
 * Parse google-services.json.
 *
 * This is kept because FirebaseTestScreen.tsx imports
 * parseGoogleServicesJson().
 */
export function parseGoogleServicesJson(jsonContent: string) {
  try {
    const data = JSON.parse(jsonContent);

    const client = data.client?.[0];
    const projectInfo = data.project_info;

    if (!client || !projectInfo) {
      throw new Error(
        "Invalid google-services.json: missing client or project_info."
      );
    }

    const apiKey =
      client.api_key?.[0]?.current_key;

    const projectId =
      projectInfo.project_id;

    const storageBucket =
      projectInfo.storage_bucket;

    const messagingSenderId =
      projectInfo.project_number;

    const appId =
      client.client_info?.mobilesdk_app_id;

    const packageName =
      client.client_info?.android_client_info?.package_name;

    if (
      !apiKey ||
      !projectId ||
      !messagingSenderId ||
      !appId
    ) {
      throw new Error(
        "google-services.json is missing required Firebase configuration values."
      );
    }

    return {
      apiKey,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      packageName,
    };
  } catch (error: any) {
    console.error(
      "Failed to parse google-services.json:",
      error
    );

    throw new Error(
      error?.message ||
        "Failed to parse google-services.json."
    );
  }
}

/**
 * Initialize Firebase.
 */
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let messaging: Messaging | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(FIREBASE_CONFIG);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  /**
   * Firebase Cloud Messaging is mainly useful on
   * supported web environments.
   *
   * Native Android push notifications are handled
   * through Capacitor Firebase plugins.
   */
  isMessagingSupported()
    .then((supported) => {
      if (supported) {
        try {
          messaging = getMessaging(app);
        } catch (error) {
          console.warn(
            "Firebase Messaging initialization skipped:",
            error
          );
        }
      }
    })
    .catch((error) => {
      console.warn(
        "Firebase Messaging support check failed:",
        error
      );
    });
} catch (error) {
  console.error(
    "Firebase initialization failed:",
    error
  );

  throw error;
}

export {
  app,
  auth,
  db,
  storage,
  messaging,
};

/**
 * Test Firestore connection.
 */
export async function testFirebaseConnection(): Promise<{
  connected: boolean;
  message: string;
  source: "server" | "cache" | "mock";
  timestamp?: string;
  projectId: string;
  error?: string;
}> {
  try {
    const testDocRef = doc(
      db,
      "test",
      "connection"
    );

    /**
     * Try writing a test document.
     *
     * If Firestore rules reject the write, we continue
     * and attempt a server read.
     */
    try {
      await setDoc(
        testDocRef,
        {
          appName: "Washy Neat",
          status: "active",
          lastTestedAt:
            new Date().toISOString(),
        },
        {
          merge: true,
        }
      );
    } catch (writeError) {
      console.warn(
        "Firestore test write failed:",
        writeError
      );
    }

    /**
     * Force a server request.
     */
    const snap =
      await getDocFromServer(testDocRef);

    if (snap.exists()) {
      return {
        connected: true,
        message:
          "Firebase Connected Successfully",
        source: "server",
        timestamp:
          new Date().toLocaleTimeString(),
        projectId:
          FIREBASE_CONFIG.projectId,
      };
    }

    return {
      connected: true,
      message:
        "Firebase Connected Successfully",
      source: "server",
      timestamp:
        new Date().toLocaleTimeString(),
      projectId:
        FIREBASE_CONFIG.projectId,
    };
  } catch (error: any) {
    console.warn(
      "Firestore server check failed:",
      error
    );

    const errorMessage =
      error?.message || String(error);

    if (
      errorMessage.includes(
        "client is offline"
      ) ||
      errorMessage.includes(
        "Could not reach Cloud Firestore"
      ) ||
      errorMessage.includes(
        "permission-denied"
      )
    ) {
      return {
        connected: false,
        message:
          "Firebase connection failed. Check Firebase configuration or Firestore rules.",
        source: "mock",
        projectId:
          FIREBASE_CONFIG.projectId,
        error: errorMessage,
      };
    }

    return {
      connected: false,
      message:
        "Firebase connection failed.",
      source: "mock",
      projectId:
        FIREBASE_CONFIG.projectId,
      error: errorMessage,
    };
  }
}

/**
 * Google authentication provider.
 */
export const googleProvider =
  new GoogleAuthProvider();

/**
 * Google Sign-In.
 *
 * Android:
 * Uses @capacitor-firebase/authentication.
 *
 * Web:
 * Uses Firebase popup authentication.
 */
export async function loginWithGoogle() {
  try {
    /**
     * Native Android/iOS flow.
     */
    if (Capacitor.isNativePlatform()) {
      const result =
        await FirebaseAuthentication.signInWithGoogle();

      if (result.credential?.idToken) {
        const credential =
          GoogleAuthProvider.credential(
            result.credential.idToken
          );

        return await signInWithCredential(
          auth,
          credential
        );
      }

      if (result.user) {
        return result;
      }

      throw new Error(
        "Google Sign-In did not return a credential or user."
      );
    }

    /**
     * Browser/web flow.
     */
    return await signInWithPopup(
      auth,
      googleProvider
    );
  } catch (error: any) {
    console.error(
      "Google Sign-In failed:",
      error
    );

    throw error;
  }
}

/**
 * Anonymous authentication.
 */
export async function loginAnonymously() {
  try {
    return await signInAnonymously(auth);
  } catch (error: any) {
    console.error(
      "Anonymous Sign-In failed:",
      error
    );

    throw error;
  }
}

/**
 * Sign out.
 */
export async function logoutUser() {
  try {
    /**
     * Sign out from the native Capacitor
     * authentication plugin.
     */
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
      } catch (error) {
        console.warn(
          "Native FirebaseAuthentication sign-out failed:",
          error
        );
      }
    }

    /**
     * Also sign out from Firebase Web SDK.
     */
    await firebaseSignOut(auth);
  } catch (error) {
    console.error(
      "Firebase sign-out failed:",
      error
    );

    throw error;
  }
}

/**
 * Washy Neat Order.
 */
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
    | "Order Placed"
    | "Picked Up"
    | "In Washing"
    | "Ironing & Folding"
    | "Out for Delivery"
    | "Delivered";

  paymentMethod:
    | "Cash on Delivery"
    | "Card"
    | "Mobile Wallet";

  paymentStatus:
    | "Pending"
    | "Paid";

  createdAt?: any;

  updatedAt?: any;
}

/**
 * Create Washy Neat order.
 */
export async function createWashyNeatOrder(
  order: Omit<WashyNeatOrder, "id">
) {
  try {
    const docRef = await addDoc(
      collection(
        db,
        "washy_neat_orders"
      ),
      {
        ...order,
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      }
    );

    return {
      id: docRef.id,
      ...order,
    };
  } catch (error) {
    console.error(
      "Failed to create Firestore order:",
      error
    );

    throw error;
  }
}

/**
 * Subscribe to a user's orders.
 */
export function subscribeToUserOrders(
  userId: string,
  callback: (
    orders: WashyNeatOrder[]
  ) => void
) {
  try {
    const ordersQuery = query(
      collection(
        db,
        "washy_neat_orders"
      ),
      where(
        "userId",
        "==",
        userId
      )
    );

    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: WashyNeatOrder[] =
          [];

        snapshot.forEach(
          (docSnap) => {
            orders.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as WashyNeatOrder);
          }
        );

        /**
         * Sort newest first.
         */
        orders.sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );

        callback(orders);
      },
      (error) => {
        console.warn(
          "Error listening to orders:",
          error
        );

        callback([]);
      }
    );
  } catch (error) {
    console.warn(
      "Firestore query error:",
      error
    );

    return () => {};
  }
}
