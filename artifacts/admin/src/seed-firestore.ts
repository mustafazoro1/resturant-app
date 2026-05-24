import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// 1. Manually parse .env to avoid external dependencies
const envPath = path.resolve(import.meta.dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Firebase configuration not found. Please make sure VITE_FIREBASE_* environment variables are set in artifacts/admin/.env");
  process.exit(1);
}

console.log("🚀 Initializing Firebase connection for project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Read store.json
const storePath = path.resolve(import.meta.dirname, "../../api-server/data/store.json");
if (!fs.existsSync(storePath)) {
  console.error("❌ Store data not found at:", storePath);
  process.exit(1);
}

const rawData = fs.readFileSync(storePath, "utf-8");
const data = JSON.parse(rawData);

async function seed() {
  console.log("🌱 Starting Firestore Seeding...");

  // Seed Categories
  if (data.categories && Array.isArray(data.categories)) {
    console.log(`\n📦 Seeding ${data.categories.length} categories...`);
    for (const cat of data.categories) {
      const docRef = doc(db, "categories", cat.id);
      await setDoc(docRef, cat);
      console.log(`   ✅ Added category: ${cat.name}`);
    }
  }

  // Seed Menu Items
  if (data.menuItems && Array.isArray(data.menuItems)) {
    console.log(`\n🍔 Seeding ${data.menuItems.length} menu items...`);
    for (const item of data.menuItems) {
      const docRef = doc(db, "menuItems", item.id);
      
      // Ensure all standard fields exist
      const sanitizedItem = {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: Number(item.price),
        category: item.category,
        available: item.available !== undefined ? item.available : true,
        spicy: item.spicy || false,
        popular: item.popular || false,
        calories: item.calories || null,
        imageUrl: item.imageUrl || null,
        offerActive: item.offerActive || false,
        offerPercentage: item.offerPercentage || null,
        offerLabel: item.offerLabel || null,
        offerStartDate: item.offerStartDate || null,
        offerEndDate: item.offerEndDate || null,
      };

      await setDoc(docRef, sanitizedItem);
      console.log(`   ✅ Added menu item: ${item.name}`);
    }
  }

  // Seed Orders
  if (data.orders && Array.isArray(data.orders)) {
    console.log(`\n📋 Seeding ${data.orders.length} orders...`);
    for (const order of data.orders) {
      const docRef = doc(db, "orders", order.id);
      await setDoc(docRef, order);
      console.log(`   ✅ Added order: ${order.id} for ${order.customerName}`);
    }
  }

  console.log("\n✨ Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
