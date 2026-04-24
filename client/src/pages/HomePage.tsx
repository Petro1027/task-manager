import { Link } from "react-router-dom";
import { useAuth } from "../app/auth-context";

function HomePage() {
  const { authUser, isAuthReady, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <span className="inline-block rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-1 text-sm text-[#646cff]">
            Frontend auth alap
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Task Manager
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-[rgba(255,255,255,0.72)]">
            Fullstack Kanban / task management portfólióprojekt. A backend auth és a
            frontend auth oldalak már működnek, most fokozatosan építjük tovább az
            alkalmazást.
          </p>

          {!isAuthReady ? (
            <div className="mt-8 rounded-2xl border border-[rgba(100,108,255,0.25)] bg-[#242424] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
                Session ellenőrzése
              </p>
              <p className="mt-2 text-[rgba(255,255,255,0.72)]">
                Betöltjük a bejelentkezési állapotot...
              </p>
            </div>
          ) : authUser ? (
            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                Bejelentkezve
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{authUser.name}</h2>
              <p className="mt-1 text-[rgba(255,255,255,0.72)]">{authUser.email}</p>

              <button
                type="button"
                onClick={logout}
                className="mt-4 rounded-xl border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/10"
              >
                Helyi kijelentkezés
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2]"
              >
                Bejelentkezés oldal
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-[rgba(100,108,255,0.35)] px-5 py-3 font-medium text-[rgba(255,255,255,0.87)] transition hover:border-[rgba(100,108,255,0.55)]"
              >
                Regisztráció oldal
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-semibold">Most készül</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[rgba(255,255,255,0.72)] marker:text-[#646cff]">
              <li>Session visszaállítás</li>
              <li>GET /api/auth/me használat</li>
              <li>Protected route alap</li>
              <li>Board UI integráció</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-semibold">Következő frontend backend kapcsolat</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[rgba(255,255,255,0.72)] marker:text-[#646cff]">
              <li>Board lista lekérése</li>
              <li>Protected route</li>
              <li>Dashboard / board UI</li>
              <li>Task kezelés frontendről</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
