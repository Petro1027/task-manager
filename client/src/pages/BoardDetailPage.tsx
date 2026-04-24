import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../app/auth-context";
import { apiUrl } from "../lib/api";
import { getAccessToken } from "../lib/auth";

type BoardDetail = {
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
  tags: Array<{
    id: string;
    name: string;
    color: string;
    boardId: string;
  }>;
  _count: {
    tasks: number;
    tags: number;
  };
};

type BoardTask = {
  id: string;
  boardId: string;
  columnId: string;
  authorId: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
  dueDate: string | null;
  archived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  column: {
    id: string;
    key: "TODO" | "IN_PROGRESS" | "DONE";
    title: string;
    position: number;
  };
  taskTags: Array<{
    taskId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      color: string;
      boardId: string;
    };
  }>;
};

type BoardDetailResponse = {
  board: BoardDetail;
  tasks: BoardTask[];
};

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "A task címe kötelező").max(200, "A task címe túl hosszú"),
  description: z.string().trim().max(5000, "A leírás túl hosszú").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  category: z.string().trim().max(100, "A kategória túl hosszú").optional(),
  columnKey: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

async function fetchBoardDetail(boardId: string) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Hiányzik a hozzáférési token.");
  }

  const [boardResponse, tasksResponse] = await Promise.all([
    fetch(apiUrl(`/api/boards/${boardId}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    fetch(apiUrl(`/api/boards/${boardId}/tasks`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  if (boardResponse.status === 401 || tasksResponse.status === 401) {
    throw new Error("A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.");
  }

  if (boardResponse.status === 404) {
    throw new Error("A board nem található.");
  }

  if (!boardResponse.ok) {
    const errorData = (await boardResponse.json()) as { message?: string };

    throw new Error(errorData.message || "Nem sikerült betölteni a boardot.");
  }

  if (!tasksResponse.ok) {
    const errorData = (await tasksResponse.json()) as { message?: string };

    throw new Error(errorData.message || "Nem sikerült betölteni a taskokat.");
  }

  const board = (await boardResponse.json()) as BoardDetail;
  const tasks = (await tasksResponse.json()) as BoardTask[];

  return {
    board,
    tasks,
  } satisfies BoardDetailResponse;
}

async function createTaskRequest(input: { boardId: string; values: CreateTaskValues }) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Hiányzik a hozzáférési token.");
  }

  const response = await fetch(apiUrl(`/api/boards/${input.boardId}/tasks`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input.values),
  });

  if (response.status === 401) {
    throw new Error("A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };

    throw new Error(errorData.message || "Nem sikerült létrehozni a taskot.");
  }

  return (await response.json()) as BoardTask;
}

function priorityBadgeClasses(priority: BoardTask["priority"]) {
  switch (priority) {
    case "HIGH":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "MEDIUM":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "LOW":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-[rgba(100,108,255,0.25)] bg-[#242424] text-[rgba(255,255,255,0.75)]";
  }
}

function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { authUser, isAuthReady } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      category: "",
      columnKey: "TODO",
    },
  });

  const boardQuery = useQuery<BoardDetailResponse, Error>({
    queryKey: ["board-detail", authUser?.id, boardId],
    queryFn: () => fetchBoardDetail(boardId ?? ""),
    enabled: isAuthReady && !!authUser && !!boardId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (values: CreateTaskValues) =>
      createTaskRequest({
        boardId: boardId ?? "",
        values,
      }),
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({
        queryKey: ["board-detail", authUser?.id, boardId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["boards", authUser?.id],
      });
    },
  });

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
        <main className="mx-auto w-full max-w-6xl">
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

  if (!boardId) {
    return <Navigate to="/boards" replace />;
  }

  if (boardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
        <main className="mx-auto w-full max-w-6xl">
          <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Betöltés
            </p>
            <p className="mt-3 text-[rgba(255,255,255,0.72)]">
              Board részletek betöltése...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (boardQuery.isError) {
    return (
      <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
        <main className="mx-auto w-full max-w-6xl">
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
            <Link
              to="/boards"
              className="text-sm text-[#646cff] transition hover:text-[#535bf2]"
            >
              ← Vissza a boardokhoz
            </Link>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-red-300">
              Hiba
            </p>
            <p className="mt-3 text-red-200">{boardQuery.error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!boardQuery.data) {
    return null;
  }

  const { board, tasks } = boardQuery.data;
  const activeTasks = tasks.filter((task) => !task.archived);

  return (
    <div className="min-h-screen bg-[#242424] px-4 py-12 text-[rgba(255,255,255,0.87)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                to="/boards"
                className="text-sm text-[#646cff] transition hover:text-[#535bf2]"
              >
                ← Vissza a boardokhoz
              </Link>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{board.title}</h1>

              <p className="mt-3 max-w-3xl text-[rgba(255,255,255,0.72)]">
                Ez a board részlet oldal a backend
                <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
                  GET /api/boards/:boardId
                </code>
                és
                <code className="mx-1 rounded bg-[#242424] px-2 py-1 text-sm text-[#646cff]">
                  GET /api/boards/:boardId/tasks
                </code>
                endpointjait használja.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#242424] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                  Taskok
                </p>
                <p className="mt-2 text-2xl font-semibold">{board._count.tasks}</p>
              </div>

              <div className="rounded-2xl bg-[#242424] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">
                  Tagek
                </p>
                <p className="mt-2 text-2xl font-semibold">{board._count.tags}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h2 className="text-2xl font-semibold">Új task létrehozása</h2>
          <p className="mt-2 text-[rgba(255,255,255,0.72)]">
            Itt közvetlenül a boardon belül tudsz új taskot létrehozni.
          </p>

          <form
            onSubmit={handleSubmit((values) => createTaskMutation.mutate(values))}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
                Cím
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="Például: API dokumentáció frissítése"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
                Leírás
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="Rövid leírás a taskhoz"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
                Prioritás
              </label>
              <select
                {...register("priority")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
                Oszlop
              </label>
              <select
                {...register("columnKey")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
                Kategória
              </label>
              <input
                type="text"
                {...register("category")}
                className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
                placeholder="Például: Backend"
              />
              {errors.category && (
                <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {createTaskMutation.isPending ? "Létrehozás..." : "Task létrehozása"}
              </button>
            </div>
          </form>

          {createTaskMutation.isError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {createTaskMutation.error.message}
            </div>
          )}

          {createTaskMutation.isSuccess && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              A task sikeresen létrejött.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h2 className="text-2xl font-semibold">Oszlopok</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {board.columns.map((column) => (
              <span
                key={column.id}
                className="rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-2 text-sm text-[rgba(255,255,255,0.78)]"
              >
                {column.title}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {board.columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const columnTasks = activeTasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position);

              return (
                <div
                  key={column.id}
                  className="rounded-3xl border border-[rgba(100,108,255,0.2)] bg-[#1a1a1a] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{column.title}</h2>
                    <span className="rounded-full border border-[rgba(100,108,255,0.2)] px-3 py-1 text-xs text-[rgba(255,255,255,0.72)]">
                      {columnTasks.length} task
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-4">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[rgba(100,108,255,0.2)] bg-[#242424] p-4 text-sm text-[rgba(255,255,255,0.6)]">
                        Nincs task ebben az oszlopban.
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <article
                          key={task.id}
                          className="rounded-2xl border border-[rgba(100,108,255,0.18)] bg-[#242424] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-medium">{task.title}</h3>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityBadgeClasses(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.72)]">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {task.category && (
                              <span className="rounded-full border border-[rgba(100,108,255,0.2)] px-3 py-1 text-xs text-[rgba(255,255,255,0.72)]">
                                {task.category}
                              </span>
                            )}

                            {task.dueDate && (
                              <span className="rounded-full border border-[rgba(100,108,255,0.2)] px-3 py-1 text-xs text-[rgba(255,255,255,0.72)]">
                                Határidő: {new Date(task.dueDate).toLocaleDateString("hu-HU")}
                              </span>
                            )}

                            {task.taskTags.map((taskTag) => (
                              <span
                                key={taskTag.tag.id}
                                className="rounded-full px-3 py-1 text-xs text-white"
                                style={{ backgroundColor: taskTag.tag.color }}
                              >
                                {taskTag.tag.name}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}

export default BoardDetailPage;
