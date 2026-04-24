import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../app/auth-context";
import { API_BASE_URL } from "../lib/api";
import { getAccessToken } from "../lib/auth";

type BoardListItem = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  columns: Array<{
    id: string;
    boardId: string;
    key: "TODO" | "IN_PROGRESS" | "DONE";
    title: string;
    position: number;
  }>;
  _count: {
    tasks: number;
    tags: number;
  };
};

async function fetchBoards() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Hiányzik a hozzáférési token.");
  }

  const response = await fetch(`${API_BASE_URL}/api/boards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.");
  }

  if (!response.ok) {
    throw new Error("Nem sikerült betölteni a boardokat.");
  }

  return (await response.json()) as BoardListItem[];
}

function BoardsPage() {
  const { authUser, isAuthReady } = useAuth();

  const boardsQuery = useQuery({
    queryKey: ["boards", authUser?.id],
    queryFn: fetchBoards,
    enabled: isAuthReady && !!authUser,
  });

  const boards = boardsQuery.data ?? [];

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
        <main className="mx-auto w-full max-w-5xl">
          <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Session ellenőrzése
            </p>
            <p className="mt-3 text-[rgba(255,255,255,0.72)]">
              Betöltjük a bejelentkezési állapotot...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/"
                className="text-sm text-[#646cff] transition hover:text-[#535bf2]"
              >
                ← Vissza a főoldalra
              </Link>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                Saját boardok
              </h1>

              <p className="mt-3 max-w-3xl text-[rgba(255,255,255,0.72)]">
                Ez az első auth-os board oldal. A lista a backend
                <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
                  GET /api/boards
                </code>
                endpointjáról jön.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm text-emerald-300">{authUser.name}</p>
              <p className="text-xs text-[rgba(255,255,255,0.7)]">
                {authUser.email}
              </p>
            </div>
          </div>
        </div>

        {boardsQuery.isLoading ? (
          <div className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Betöltés
            </p>
            <p className="mt-3 text-[rgba(255,255,255,0.72)]">
              Boardok betöltése...
            </p>
          </div>
        ) : boardsQuery.isError ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-red-300">
              Hiba
            </p>
            <p className="mt-3 text-red-200">{boardsQuery.error.message}</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Üres állapot
            </p>
            <p className="mt-3 text-[rgba(255,255,255,0.72)]">
              Ehhez a felhasználóhoz még nincs board.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <article
                key={board.id}
                className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
                      Board
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {board.title}
                    </h2>
                  </div>

                  <span className="rounded-full border border-[rgba(100,108,255,0.25)] px-3 py-1 text-xs text-[rgba(255,255,255,0.75)]">
                    {board.columns.length} oszlop
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#242424] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                      Taskok
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {board._count.tasks}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#242424] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                      Tagek
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {board._count.tags}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-[rgba(255,255,255,0.82)]">
                    Oszlopok
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {board.columns.map((column) => (
                      <span
                        key={column.id}
                        className="rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-2 text-sm text-[rgba(255,255,255,0.78)]"
                      >
                        {column.title}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BoardsPage;
