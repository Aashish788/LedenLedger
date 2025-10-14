import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { userDataService } from "./services/api/userDataService";

// 🔧 Expose userDataService for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).userDataService = userDataService;
  console.log('🔍 Debug mode: window.userDataService available');
  console.log('💡 Run: window.userDataService.debugCustomers()');
}

createRoot(document.getElementById("root")!).render(<App />);

