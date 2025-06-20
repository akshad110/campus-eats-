// Quick test script to verify API fallback is working
import { ApiService } from "./src/lib/api.js";

async function testAPI() {
  console.log("🧪 Testing API fallback...");

  try {
    // Test getShops with fallback
    console.log("Testing getShops...");
    const shops = await ApiService.getShops();
    console.log(`Found ${shops.length} shops`);

    // Test getShopsByOwner with fallback
    console.log("Testing getShopsByOwner...");
    const ownerShops = await ApiService.getShopsByOwner("test-owner");
    console.log(`Found ${ownerShops.length} shops for owner`);

    console.log("✅ API tests completed");
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

testAPI();
