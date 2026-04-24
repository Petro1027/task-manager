import React from "react";
import { useLanguage } from "../../app/language-context";
import { useTheme } from "../../app/theme-context";

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      style={{
        transition: "transform 180ms ease, opacity 180ms ease",
        transform: active ? "scale(1) rotate(0deg)" : "scale(0.85) rotate(-20deg)",
        opacity: active ? 1 : 0.7,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="M4.93 4.93l1.77 1.77" />
      <path d="M17.3 17.3l1.77 1.77" />
      <path d="M17.3 6.7l1.77-1.77" />
      <path d="M4.93 19.07l1.77-1.77" />
    </svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      style={{
        transition: "transform 180ms ease, opacity 180ms ease",
        transform: active ? "scale(1) rotate(0deg)" : "scale(0.85) rotate(20deg)",
        opacity: active ? 1 : 0.7,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

type OptionButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};

function OptionButton({ active, onClick, icon, label }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderRadius: "14px",
        border: active
          ? "1px solid rgba(100,108,255,0.45)"
          : "1px solid var(--panel-border)",
        background: active ? "rgba(100,108,255,0.14)" : "var(--chip-bg)",
        color: "var(--text-primary)",
        padding: "10px 12px",
        cursor: "pointer",
        transition: "all 180ms ease",
        fontSize: "14px",
        fontWeight: 600,
        minWidth: "118px",
        justifyContent: "flex-start",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          width: "28px",
          height: "28px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "999px",
          background: "rgba(100,108,255,0.12)",
          fontSize: "16px",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

function PreferenceGroup({
                           title,
                           children,
                         }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <div
        style={{
          minWidth: "92px",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--text-muted)",
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function GlobalPreferencesPanel() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          color: "var(--accent)",
          fontWeight: 700,
        }}
      >
        {t("preferences")}
      </div>

      <PreferenceGroup title={t("language")}>
        <OptionButton
          active={language === "hu"}
          onClick={() => setLanguage("hu")}
          icon={
            <span style={{ transform: language === "hu" ? "scale(1.08)" : "scale(1)" }}>
              🇭🇺
            </span>
          }
          label={t("hungarian")}
        />

        <OptionButton
          active={language === "en"}
          onClick={() => setLanguage("en")}
          icon={
            <span style={{ transform: language === "en" ? "scale(1.08)" : "scale(1)" }}>
              🇬🇧
            </span>
          }
          label={t("english")}
        />
      </PreferenceGroup>

      <PreferenceGroup title={t("theme")}>
        <OptionButton
          active={theme === "light"}
          onClick={() => setTheme("light")}
          icon={<SunIcon active={theme === "light"} />}
          label={t("light")}
        />

        <OptionButton
          active={theme === "dark"}
          onClick={() => setTheme("dark")}
          icon={<MoonIcon active={theme === "dark"} />}
          label={t("dark")}
        />
      </PreferenceGroup>
    </div>
  );
}

export default GlobalPreferencesPanel;
