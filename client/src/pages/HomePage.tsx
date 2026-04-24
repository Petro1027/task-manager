import { Link } from "react-router-dom";

function HomePage() {
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
            Fullstack Kanban / task management portfólióprojekt. A backend auth már
            készül, most a frontend routing alapot építjük fel.
          </p>

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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-semibold">Most készül</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[rgba(255,255,255,0.72)] marker:text-[#646cff]">
              <li>Frontend routing</li>
              <li>Login oldal</li>
              <li>Register oldal</li>
              <li>Auth API integráció</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6">
            <h2 className="text-2xl font-semibold">Következő backend kapcsolat</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[rgba(255,255,255,0.72)] marker:text-[#646cff]">
              <li>Register form bekötése</li>
              <li>Login form bekötése</li>
              <li>Token mentése</li>
              <li>/api/auth/me használata</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
