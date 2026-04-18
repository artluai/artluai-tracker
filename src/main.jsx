import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import App from "./App";
import "./index.css";

// Set the initial theme attribute BEFORE React renders so there's no flash
(function initTheme() {
  try {
    const stored = localStorage.getItem("artlu-theme");
    const t = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.setAttribute("data-theme", t);
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
