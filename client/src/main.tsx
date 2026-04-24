import React from "react";
import ReactDOM from "react-dom/client";
import { LanguageProvider } from "./app/language-context";
import { ThemeProvider } from "./app/theme-context";
import App from "./App";
import GlobalPreferencesPanel from "./components/layout/GlobalPreferencesPanel";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <GlobalPreferencesPanel />
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
