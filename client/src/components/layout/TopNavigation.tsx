import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../app/auth-context";
import { useLanguage } from "../../app/language-context";
import { useTheme } from "../../app/theme-context";

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: active ? "rotate(0deg) scale(1)" : "rotate(-20deg) scale(0.92)",
        transition: "transform 180ms ease, opacity 180ms ease",
        opacity: active ? 1 : 0.75,
      }}
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
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: active ? "rotate(0deg) scale(1)" : "rotate(20deg) scale(0.92)",
        transition: "transform 180ms ease, opacity 180ms ease",
        opacity: active ? 1 : 0.75,
      }}
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function navItemClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[rgba(124,131,255,0.16)] text-[var(--text-primary)]"
      : "text-[var(--text-secondary)] hover:bg-[rgba(124,131,255,0.08)] hover:text-[var(--text-primary)]",
  ].join(" ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TopNavigation() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { authUser, logout } = useAuth();

  const labels =
    language === "hu"
      ? {
        home: "Főoldal",
        boards: "Boardok",
        login: "Belépés",
        register: "Regisztráció",
        light: "Világos",
        dark: "Sötét",
        logout: "Kijelentkezés",
      }
      : {
        home: "Home",
        boards: "Boards",
        login: "Sign in",
        register: "Register",
        light: "Light",
        dark: "Dark",
        logout: "Log out",
      };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: "var(--header-bg)",
        borderColor: "var(--panel-border)",
        boxShadow: "var(--header-shadow)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
              }}
            >
              TM
            </div>

            <div className="leading-tight">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Task Manager
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Kanban portfolio app
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navItemClass}>
              {labels.home}
            </NavLink>

            <NavLink to="/boards" className={navItemClass}>
              {labels.boards}
            </NavLink>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div
            className="flex items-center rounded-2xl border p-1"
            style={{
              borderColor: "var(--panel-border)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage("hu")}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                background:
                  language === "hu" ? "rgba(124,131,255,0.16)" : "transparent",
                color:
                  language === "hu"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <span className="text-base">🇭🇺</span>
              <span>HU</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage("en")}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                background:
                  language === "en" ? "rgba(124,131,255,0.16)" : "transparent",
                color:
                  language === "en"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <span className="text-base">🇬🇧</span>
              <span>EN</span>
            </button>
          </div>

          <div
            className="flex items-center rounded-2xl border p-1"
            style={{
              borderColor: "var(--panel-border)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <button
              type="button"
              onClick={() => setTheme("light")}
              title={labels.light}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                background:
                  theme === "light" ? "rgba(124,131,255,0.16)" : "transparent",
                color:
                  theme === "light"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <SunIcon active={theme === "light"} />
              <span className="hidden sm:inline">{labels.light}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              title={labels.dark}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                background:
                  theme === "dark" ? "rgba(124,131,255,0.16)" : "transparent",
                color:
                  theme === "dark"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              <MoonIcon active={theme === "dark"} />
              <span className="hidden sm:inline">{labels.dark}</span>
            </button>
          </div>

          {authUser ? (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-3 rounded-2xl border px-3 py-2"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {getInitials(authUser.name)}
                </div>

                <div className="hidden md:block leading-tight">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {authUser.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {authUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
                style={{
                  color: "var(--text-primary)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--panel-border)",
                }}
              >
                {labels.logout}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
                style={{ color: "var(--text-primary)" }}
              >
                {labels.login}
              </Link>

              <Link
                to="/register"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                }}
              >
                {labels.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavigation;
