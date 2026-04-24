import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../app/auth-context";
import { useLanguage } from "../app/language-context";
import AppShell from "../components/layout/AppShell";
import SurfaceCard from "../components/ui/SurfaceCard";
import { fetchBoards, type BoardListItem } from "../features/boards/boards-api";
import { apiUrl } from "../lib/api";
import { getAccessToken } from "../lib/auth";

const createBoardSchemaBase = z.object({
  title: z.string().trim().min(1).max(100),
});

type CreateBoardValues = z.infer<typeof createBoardSchemaBase>;

async function createBoardRequest(values: CreateBoardValues) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token.");
  }

  const response = await fetch(apiUrl("/api/boards"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });

  if (response.status === 401) {
    throw new Error("Session expired or invalid.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to create board.");
  }

  return (await response.json()) as BoardListItem;
}

function BoardsPage() {
  const { authUser, isAuthReady } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const copy =
    language === "hu"
      ? {
        badge: "Boardok",
        title: "Saját boardok",
        description:
          "Itt láthatod az összes saját boardodat, újakat hozhatsz létre, és megnyithatod a részletes Kanban nézetet.",
        loadingTitle: "Session ellenőrzése",
        loadingText: "Betöltjük a bejelentkezési állapotot...",
        createTitle: "Új board létrehozása",
        createDescription:
          "Adj meg egy címet, és a backend automatikusan létrehozza a 3 alap oszlopot.",
        boardTitleLabel: "Board címe",
        boardPlaceholder: "Például: Sprint Planning",
        createButton: "Board létrehozása",
        creatingButton: "Létrehozás...",
        createSuccess: "A board sikeresen létrejött.",
        emptyTitle: "Még nincs board",
        emptyText: "Ehhez a felhasználóhoz még nincs board.",
        loadErrorTitle: "Hiba",
        loadingBoards: "Boardok betöltése...",
        openBoard: "Megnyitás",
        columns: "Oszlopok",
        tasks: "Taskok",
        tags: "Tagek",
        overviewTitle: "Áttekintés",
        overviewText:
          "A boardokhoz tartozó taskok és tagek számát itt gyorsan át tudod nézni.",
        accountTitle: "Aktív profil",
        titleRequired: "A board címe kötelező.",
        titleTooLong: "A board címe túl hosszú.",
        missingToken: "Hiányzik a hozzáférési token.",
        sessionExpired: "A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.",
        createFallback: "Nem sikerült létrehozni a boardot.",
      }
      : {
        badge: "Boards",
        title: "My boards",
        description:
          "Here you can see all your boards, create new ones, and open the detailed Kanban view.",
        loadingTitle: "Checking session",
        loadingText: "Loading authentication state...",
        createTitle: "Create a new board",
        createDescription:
          "Enter a title and the backend will automatically create the 3 default columns.",
        boardTitleLabel: "Board title",
        boardPlaceholder: "For example: Sprint Planning",
        createButton: "Create board",
        creatingButton: "Creating...",
        createSuccess: "Board created successfully.",
        emptyTitle: "No boards yet",
        emptyText: "There are no boards for this user yet.",
        loadErrorTitle: "Error",
        loadingBoards: "Loading boards...",
        openBoard: "Open",
        columns: "Columns",
        tasks: "Tasks",
        tags: "Tags",
        overviewTitle: "Overview",
        overviewText:
          "You can quickly review the number of tasks and tags on each board here.",
        accountTitle: "Active profile",
        titleRequired: "Board title is required.",
        titleTooLong: "Board title is too long.",
        missingToken: "Missing access token.",
        sessionExpired: "Session expired or invalid. Please sign in again.",
        createFallback: "Failed to create board.",
      };

  const localizedSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, copy.titleRequired)
      .max(100, copy.titleTooLong),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardValues>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      title: "",
    },
  });

  const boardsQuery = useQuery({
    queryKey: ["boards", authUser?.id],
    queryFn: fetchBoards,
    enabled: isAuthReady && !!authUser,
  });

  const createBoardMutation = useMutation({
    mutationFn: async (values: CreateBoardValues) => {
      try {
        return await createBoardRequest(values);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        if (error.message === "Missing access token.") {
          throw new Error(copy.missingToken);
        }

        if (error.message === "Session expired or invalid.") {
          throw new Error(copy.sessionExpired);
        }

        if (error.message === "Failed to create board.") {
          throw new Error(copy.createFallback);
        }

        throw error;
      }
    },
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({
        queryKey: ["boards", authUser?.id],
      });
    },
  });

  const boards = boardsQuery.data ?? [];

  if (!isAuthReady) {
    return (
      <AppShell>
        <SurfaceCard>
          <p
            className="text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--accent)" }}
          >
            {copy.loadingTitle}
          </p>
          <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            {copy.loadingText}
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <SurfaceCard>
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
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

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              {copy.title}
            </h1>

            <p
              className="mt-4 max-w-2xl text-base leading-8 md:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {copy.description}
            </p>
          </div>

          <div
            className="w-full max-w-sm rounded-[28px] border p-5"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--panel-border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              {copy.accountTitle}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {authUser.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-semibold">{authUser.name}</h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {authUser.email}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl border p-4"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--panel-border)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                  {copy.tasks}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {boards.reduce((sum, board) => sum + board._count.tasks, 0)}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--panel-border)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                  {copy.tags}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {boards.reduce((sum, board) => sum + board._count.tags, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <h2 className="text-2xl font-semibold">{copy.createTitle}</h2>
          <p className="mt-3 text-base leading-7" style={{ color: "var(--text-secondary)" }}>
            {copy.createDescription}
          </p>

          <form
            onSubmit={handleSubmit((values) => createBoardMutation.mutate(values))}
            className="mt-6 flex flex-col gap-5"
          >
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {copy.boardTitleLabel}
              </label>

              <input
                type="text"
                {...register("title")}
                placeholder={copy.boardPlaceholder}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "var(--surface-3)",
                  color: "var(--text-primary)",
                }}
              />

              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {createBoardMutation.isError && (
              <div
                className="rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "rgba(239, 68, 68, 0.28)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                }}
              >
                {createBoardMutation.error.message}
              </div>
            )}

            {createBoardMutation.isSuccess && (
              <div
                className="rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--success-border)",
                  background: "var(--success-soft)",
                  color: "#86efac",
                }}
              >
                {copy.createSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={createBoardMutation.isPending}
              className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
              }}
            >
              {createBoardMutation.isPending
                ? copy.creatingButton
                : copy.createButton}
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-2xl font-semibold">{copy.overviewTitle}</h2>
          <p className="mt-3 text-base leading-7" style={{ color: "var(--text-secondary)" }}>
            {copy.overviewText}
          </p>

          {boardsQuery.isLoading ? (
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--panel-border)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {copy.loadingBoards}
              </p>
            </div>
          ) : boardsQuery.isError ? (
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                borderColor: "rgba(239, 68, 68, 0.28)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
              }}
            >
              <p className="text-sm font-medium">{copy.loadErrorTitle}</p>
              <p className="mt-2 text-sm">{boardsQuery.error.message}</p>
            </div>
          ) : boards.length === 0 ? (
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--panel-border)",
              }}
            >
              <p className="text-lg font-semibold">{copy.emptyTitle}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {copy.emptyText}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {boards.map((board) => (
                <article
                  key={board.id}
                  className="rounded-[28px] border p-5"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--panel-border)",
                  }}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <p
                        className="text-xs uppercase tracking-[0.22em]"
                        style={{ color: "var(--accent)" }}
                      >
                        {copy.badge}
                      </p>

                      <h3 className="mt-2 text-2xl font-semibold">{board.title}</h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {board.columns.map((column) => (
                          <span
                            key={column.id}
                            className="rounded-full border px-3 py-1 text-xs font-medium"
                            style={{
                              borderColor: "var(--panel-border)",
                              background: "var(--chip-bg)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {column.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex w-full max-w-xs flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className="rounded-2xl border p-4"
                          style={{
                            background: "var(--surface-3)",
                            borderColor: "var(--panel-border)",
                          }}
                        >
                          <p
                            className="text-xs uppercase tracking-[0.18em]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {copy.tasks}
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {board._count.tasks}
                          </p>
                        </div>

                        <div
                          className="rounded-2xl border p-4"
                          style={{
                            background: "var(--surface-3)",
                            borderColor: "var(--panel-border)",
                          }}
                        >
                          <p
                            className="text-xs uppercase tracking-[0.18em]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {copy.tags}
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {board._count.tags}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/boards/${board.id}`}
                        className="rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                        }}
                      >
                        {copy.openBoard}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

export default BoardsPage;
