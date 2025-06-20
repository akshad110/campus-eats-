import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import test data utility for development
if (import.meta.env.DEV) {
  import("./lib/createTestData");
}

createRoot(document.getElementById("root")!).render(<App />);
