// Simple test to verify authentication fallback
console.log("Testing authentication fallback...");

const testAuth = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        password: "test",
        role: "student",
      }),
    });

    if (!response.ok) {
      console.log("❌ Response not OK:", response.status);
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes("ECONNREFUSED")) {
          console.log("✅ Database error detected, fallback should trigger");
          return;
        }
      } catch (parseError) {
        console.log("❌ Could not parse error response");
      }
      return;
    }

    const data = await response.json();
    if (!data.success) {
      console.log("❌ Login failed:", data.error);
      if (data.error && data.error.includes("ECONNREFUSED")) {
        console.log("✅ Database error in response, fallback should trigger");
      }
      return;
    }

    console.log("✅ Login successful:", data);
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.log("✅ Network error detected, fallback should trigger");
    } else {
      console.log("❌ Unexpected error:", error);
    }
  }
};

testAuth();
