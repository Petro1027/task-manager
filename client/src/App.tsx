function App() {
  return (
    <div className="min-h-screen px-4 py-12">
      <main className="mx-auto w-full max-w-5xl">
        <span className="inline-block rounded-full border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] px-3 py-1 text-sm text-[#646cff]">
          Project feladat
        </span>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-[rgba(255,255,255,0.87)] sm:text-6xl">
          Task Manager
        </h1>

        <p className="mt-6 max-w-3xl text-xl leading-9 text-[rgba(255,255,255,0.72)]">
          Fullstack Kanban / task management webalkalmazás React, TypeScript,
          Node.js, Express, PostgreSQL és Prisma stackkel.
        </p>

        <section className="mt-10 rounded-3xl border border-[rgba(100,108,255,0.35)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:border-[rgba(100,108,255,0.55)]">
          <h2 className="text-3xl font-semibold text-[rgba(255,255,255,0.87)]">
            Tervezett funkciók
          </h2>

          <ul className="mt-6 space-y-4 pl-6 text-lg text-[rgba(255,255,255,0.72)] marker:text-[#646cff]">
            <li>Regisztráció és bejelentkezés</li>
            <li>Saját boardok</li>
            <li>3 oszlopos Kanban nézet</li>
            <li>Task létrehozás, szerkesztés, törlés</li>
            <li>Drag and drop</li>
            <li>Keresés és szűrés</li>
            <li>Dashboard statisztikák</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
