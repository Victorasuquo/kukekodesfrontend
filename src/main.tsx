import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import api from "./services/api";

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
window.addEventListener('online', () => { void api.flushOfflineProgress(); });

createRoot(document.getElementById("root")!).render(<App />);
