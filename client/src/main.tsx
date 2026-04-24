import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./app/theme-context";
import { LanguageProvider } from "./app/language-context";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
