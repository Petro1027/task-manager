import { useState } from "react";
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-5 w-5">
      <span
        className="absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition-all"
        style={{
          transform: open ? "translateY(6px) rotate(45deg)" : "translateY(0) rotate(0deg)",
        }}
      />
      <span
        className="absolute left-0 top-[9px] block h-0.5 w-5 rounded-full bg-current transition-all"
        style={{
          opacity: open ? 0 : 1,
        }}
      />
      <span
        className="absolute left-0 top-[17px] block h-0.5 w-5 rounded-full bg-current transition-all"
        style={{
          transform: open ? "translateY(-6px) rotate(-45deg)" : "translateY(0) rotate(0deg)",
        }}
      />
    </div>
  );
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

function navItemClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[rgba(124,131,255,0.16)] text-[var(--text-primary)]"
      : "text-[var(--text-secondary)] hover:bg-[rgba(124,131,255,0.08)] hover:text-[var(--text-primary)]",
  ].join(" ");
}

function pillButtonStyle(active: boolean) {
  return {
    background: active ? "rgba(124,131,255,0.16)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-secondary)",
  };
}

function TopNavigation() {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { authUser, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        menu: "Menü",
      }
      : {
        home: "Home",
        boards: "Boards",
        login: "Sign in",
        register: "Register",
        light: "Light",
        dark: "Dark",
        logout: "Log out",
        menu: "Menu",
      };

  const closeMenus = () => {
    setMobileOpen(false);
    setUserMenuOpen(false);
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
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3" onClick={closeMenus}>
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

            <nav className="hidden items-center gap-1 lg:flex">
              <NavLink to="/" end className={navItemClass}>
                {labels.home}
              </NavLink>

              <NavLink to="/boards" className={navItemClass}>
                {labels.boards}
              </NavLink>
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
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
                style={pillButtonStyle(language === "hu")}
              >
                <span className="text-base">🇭🇺</span>
                <span>HU</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("en")}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                style={pillButtonStyle(language === "en")}
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
                style={pillButtonStyle(theme === "light")}
              >
                <SunIcon active={theme === "light"} />
                <span>{labels.light}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                title={labels.dark}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                style={pillButtonStyle(theme === "dark")}
              >
                <MoonIcon active={theme === "dark"} />
                <span>{labels.dark}</span>
              </button>
            </div>

            {authUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-2xl border px-3 py-2 transition hover:opacity-95"
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

                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {authUser.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {authUser.email}
                    </p>
                  </div>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-3 min-w-[240px] rounded-2xl border p-3"
                    style={{
                      borderColor: "var(--panel-border)",
                      background: "var(--surface-2)",
                      boxShadow: "var(--panel-shadow)",
                    }}
                  >
                    <div className="px-2 pb-3">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {authUser.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {authUser.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:opacity-90"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--panel-border)",
                      }}
                    >
                      {labels.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition lg:hidden"
            style={{
              borderColor: "var(--panel-border)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-primary)",
            }}
            aria-label={labels.menu}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>

        {mobileOpen && (
          <div
            className="mt-4 rounded-3xl border p-4 lg:hidden"
            style={{
              borderColor: "var(--panel-border)",
              background: "var(--surface-2)",
              boxShadow: "var(--panel-shadow)",
            }}
          >
            <div className="flex flex-col gap-3">
              <NavLink to="/" end className={navItemClass} onClick={closeMenus}>
                {labels.home}
              </NavLink>

              <NavLink to="/boards" className={navItemClass} onClick={closeMenus}>
                {labels.boards}
              </NavLink>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
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
                  style={pillButtonStyle(language === "hu")}
                >
                  <span>🇭🇺</span>
                  <span>HU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                  style={pillButtonStyle(language === "en")}
                >
                  <span>🇬🇧</span>
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
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                  style={pillButtonStyle(theme === "light")}
                >
                  <SunIcon active={theme === "light"} />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
                  style={pillButtonStyle(theme === "dark")}
                >
                  <MoonIcon active={theme === "dark"} />
                </button>
              </div>
            </div>

            {authUser ? (
              <div
                className="mt-4 rounded-2xl border p-4"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {getInitials(authUser.name)}
                  </div>

                  <div>
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
                  onClick={() => {
                    closeMenus();
                    logout();
                  }}
                  className="mt-4 w-full rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-90"
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
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-center transition hover:opacity-90"
                  style={{
                    color: "var(--text-primary)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--panel-border)",
                  }}
                >
                  {labels.login}
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenus}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-center text-white shadow-lg transition hover:opacity-95"
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
        )}
      </div>
    </header>
  );
}

export default TopNavigation;
