import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <Link
            to="/"
            className="text-sm text-[#646cff] transition hover:text-[#535bf2]"
          >
            ← Vissza a főoldalra
          </Link>

          <h1 className="mt-6 text-3xl font-semibold">Regisztráció</h1>

          <p className="mt-3 text-[rgba(255,255,255,0.72)]">
            A következő lépésben ide kötjük be a valódi regisztrációs formot és az
            <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
              /api/auth/register
            </code>
            endpointot.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-[rgba(100,108,255,0.25)] bg-[#242424] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
              Placeholder oldal
            </p>
            <p className="mt-2 text-lg text-[rgba(255,255,255,0.8)]">
              Ide jön majd a név + email + jelszó form.
            </p>
          </div>

          <p className="mt-6 text-sm text-[rgba(255,255,255,0.65)]">
            Van már fiókod?{" "}
            <Link to="/login" className="text-[#646cff] hover:text-[#535bf2]">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
