import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="text-sm uppercase tracking-[0.3em] text-[#646cff]">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Az oldal nem található</h1>
        <p className="mt-4 max-w-xl text-[rgba(255,255,255,0.72)]">
          A keresett oldal nem létezik, vagy még nem készült el ebben a projektben.
        </p>

        <Link
          to="/"
          className="mt-8 rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2]"
        >
          Vissza a főoldalra
        </Link>
      </main>
    </div>
  );
}

export default NotFoundPage;
