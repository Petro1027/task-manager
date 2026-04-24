import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import SurfaceCard from "../components/ui/SurfaceCard";
import { useAuth } from "../app/auth-context";
import { useLanguage } from "../app/language-context";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function HomePage() {
  const { authUser, isAuthReady, logout } = useAuth();
  const { language } = useLanguage();

  const copy =
    language === "hu"
      ? {
        badge: "Frontend auth alap",
        title: "Task Manager",
        description:
          "Fullstack Kanban / task management portfólióprojekt. A backend auth és a frontend auth oldalak már működnek, most fokozatosan építjük tovább az alkalmazást.",
        loadingTitle: "Session ellenőrzése",
        loadingText: "Betöltjük a bejelentkezési állapotot...",
        signedInTitle: "Bejelentkezve",
        boardsButton: "Saját boardok",
        loginButton: "Bejelentkezés oldal",
        registerButton: "Regisztráció oldal",
        logoutButton: "Kijelentkezés",
        nowBuildingTitle: "Most készül",
        nextUpTitle: "Következő frontend backend kapcsolat",
        nowBuildingItems: [
          "Session visszaállítás",
          "GET /api/auth/me használat",
          "Board lista oldal",
          "Protected route alap",
        ],
        nextUpItems: [
          "Board létrehozás frontendről",
          "Board részlet oldal",
          "Task kezelés frontendről",
          "Kanban UI",
        ],
      }
      : {
        badge: "Frontend auth foundation",
        title: "Task Manager",
        description:
          "A fullstack Kanban / task management portfolio project. Backend auth and frontend auth pages are already working, and now we are building the application further step by step.",
        loadingTitle: "Checking session",
        loadingText: "Loading authentication state...",
        signedInTitle: "Signed in",
        boardsButton: "My boards",
        loginButton: "Login page",
        registerButton: "Register page",
        logoutButton: "Log out",
        nowBuildingTitle: "In progress",
        nextUpTitle: "Next frontend backend integration",
        nowBuildingItems: [
          "Session restore",
          "GET /api/auth/me integration",
          "Board list page",
          "Protected route foundation",
        ],
        nextUpItems: [
          "Board creation from frontend",
          "Board detail page",
          "Task handling from frontend",
          "Kanban UI",
        ],
      };

  return (
    <AppShell>
      <SurfaceCard>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span
              className="inline-flex rounded-full border px-3 py-1 text-sm font-medium"
              style={{
                borderColor: "var(--panel-border)",
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              {copy.badge}
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              {copy.title}
            </h1>

            <p
              className="mt-5 max-w-2xl text-base leading-8 md:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {copy.description}
            </p>

            {!isAuthReady ? (
              <div
                className="mt-8 rounded-3xl border p-5"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--panel-border)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-[0.22em]"
                  style={{ color: "var(--accent)" }}
                >
                  {copy.loadingTitle}
                </p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {copy.loadingText}
                </p>
              </div>
            ) : authUser ? (
              <div
                className="mt-8 flex flex-col gap-5 rounded-[28px] border p-6 md:flex-row md:items-center md:justify-between"
                style={{
                  background: "var(--success-soft)",
                  borderColor: "var(--success-border)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    {getInitials(authUser.name)}
                  </div>

                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.22em]"
                      style={{ color: "var(--accent)" }}
                    >
                      {copy.signedInTitle}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">{authUser.name}</h2>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {authUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/boards"
                    className="rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                      boxShadow: "0 10px 24px rgba(99, 102, 241, 0.28)",
                    }}
                  >
                    {copy.boardsButton}
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-2xl border px-5 py-3 text-sm font-semibold"
                    style={{
                      borderColor: "var(--panel-border)",
                      background: "var(--chip-bg)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {copy.logoutButton}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                    boxShadow: "0 10px 24px rgba(99, 102, 241, 0.28)",
                  }}
                >
                  {copy.loginButton}
                </Link>

                <Link
                  to="/register"
                  className="rounded-2xl border px-5 py-3 text-sm font-semibold"
                  style={{
                    borderColor: "var(--panel-border)",
                    background: "var(--chip-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                  {copy.registerButton}
                </Link>
              </div>
            )}
          </div>

          <div
            className="w-full max-w-sm rounded-[28px] border p-5"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--panel-border)",
            }}
          >
            <div
              className="rounded-2xl border p-4"
              style={{
                background: "var(--surface-3)",
                borderColor: "var(--panel-border)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Fullstack workflow
              </p>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Frontend</span>
                <span style={{ color: "var(--text-primary)" }}>React + TypeScript</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Backend</span>
                <span style={{ color: "var(--text-primary)" }}>Node + Express</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Database</span>
                <span style={{ color: "var(--text-primary)" }}>PostgreSQL + Prisma</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>UI goal</span>
                <span style={{ color: "var(--text-primary)" }}>Mini Jira / YouTrack</span>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard>
          <h2 className="text-2xl font-semibold">{copy.nowBuildingTitle}</h2>
          <ul
            className="mt-5 list-disc space-y-3 pl-5 text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            {copy.nowBuildingItems.map((item) => (
              <li key={item} className="marker:text-[var(--accent)]">
                {item}
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-2xl font-semibold">{copy.nextUpTitle}</h2>
          <ul
            className="mt-5 list-disc space-y-3 pl-5 text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            {copy.nextUpItems.map((item) => (
              <li key={item} className="marker:text-[var(--accent)]">
                {item}
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

export default HomePage;
