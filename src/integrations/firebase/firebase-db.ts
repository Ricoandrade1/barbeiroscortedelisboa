import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FirebaseOptions } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC8bnp38xAw-ZDVch74vXABDrhxKtdVhvM",
  authDomain: "appbarbercortesdelisboa.firebaseapp.com",
  projectId: "appbarbercortesdelisboa",
  storageBucket: "appbarbercortesdelisboa.firebasestorage.app",
  messagingSenderId: "564795996987",
  appId: "1:564795996987:web:5bc9aaec1490847947551e",
  measurementId: "G-FE5R84694M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Products
export const getProducts = async () => {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return productList as Product[];
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "products"), product);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id'>>) => {
  try {
    const productDoc = doc(db, "products", id);
    await updateDoc(productDoc, product);
    console.log("Document updated with ID: ", id);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};


export const deleteProduct = async (id: string) => {
  try {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
    console.log("Document deleted with ID: ", id);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

// Services
export const getServices = async () => {
  const servicesCol = collection(db, 'services');
  const serviceSnapshot = await getDocs(servicesCol);
  const serviceList = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return serviceList as ServiceType[];
};

export const addService = async (service: Omit<ServiceType, 'id'>) => {
   try {
    const docRef = await addDoc(collection(db, "services"), service);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Barbers
export const getBarbers = async () => {
  const barbersCol = collection(db, 'barbers');
  const barberSnapshot = await getDocs(barbersCol);
  const barberList = barberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return barberList as Barber[];
};

// Authentication
export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Types
export interface Product {
    id?: string;
    name: string;
    stock: number;
    basePrice: number;
}

export interface ServiceType {
    id?: string;
    name: string;
    price: number;
}

export interface Barber {
    id?: string;
    name: string;
    services: number;
    rating: number;
    balance: number;
}
