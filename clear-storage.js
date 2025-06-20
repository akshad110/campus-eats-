// Simple script to clear localStorage for fresh start
// Run this in browser console if needed

const clearCampusEatsStorage = () => {
  const keys = Object.keys(localStorage);
  const campusEatsKeys = keys.filter(
    (key) =>
      key.startsWith("campuseats_") ||
      key.includes("user_data") ||
      key.includes("auth_token"),
  );

  campusEatsKeys.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });

  console.log("✅ CampusEats localStorage cleared");
  window.location.reload();
};

// Make it available globally
window.clearCampusEatsStorage = clearCampusEatsStorage;

console.log("💡 Run clearCampusEatsStorage() to clear all app data");
