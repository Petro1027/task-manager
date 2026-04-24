import { zodResolver } from "@hookform/resolvers/zod";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useParams } from "react-router-dom";
import { z } from "zod";
import SortableTaskCard from "../components/tasks/SortableTaskCard";
import TaskColumn from "../components/tasks/TaskColumn";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
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

type TasksByColumn = Record<string, BoardTask[]>;

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

function normalizeColumnTasks(
  tasks: BoardTask[],
  column: BoardDetail["columns"][number],
): BoardTask[] {
  return tasks.map((task, index) => ({
    ...task,
    columnId: column.id,
    column: {
      id: column.id,
      key: column.key,
      title: column.title,
      position: column.position,
    },
    position: index,
  }));
}

function buildTasksByColumn(
  columns: BoardDetail["columns"],
  tasks: BoardTask[],
): TasksByColumn {
  const next: TasksByColumn = {};

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  for (const column of sortedColumns) {
    next[column.id] = [];
  }

  const activeTasks = tasks
    .filter((task) => !task.archived)
    .sort((a, b) => a.position - b.position);

  for (const task of activeTasks) {
    if (!next[task.columnId]) {
      next[task.columnId] = [];
    }

    next[task.columnId].push(task);
  }

  for (const column of sortedColumns) {
    next[column.id] = normalizeColumnTasks(next[column.id] ?? [], column);
  }

  return next;
}

function findTaskLocation(taskId: string, tasksByColumn: TasksByColumn) {
  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    const index = tasks.findIndex((task) => task.id === taskId);

    if (index !== -1) {
      return {
        columnId,
        index,
        task: tasks[index],
      };
    }
  }

  return null;
}

function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { authUser, isAuthReady } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

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

  useEffect(() => {
    if (!boardQuery.data) {
      return;
    }

    setTasksByColumn(
      buildTasksByColumn(boardQuery.data.board.columns, boardQuery.data.tasks),
    );
  }, [boardQuery.data]);

  const sortedColumns = useMemo(() => {
    if (!boardQuery.data) {
      return [];
    }

    return [...boardQuery.data.board.columns].sort((a, b) => a.position - b.position);
  }, [boardQuery.data]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!boardQuery.data) {
      return;
    }

    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overType = over.data.current?.type as string | undefined;

    setTasksByColumn((previous) => {
      const source = findTaskLocation(activeId, previous);

      if (!source) {
        return previous;
      }

      const sourceColumn = sortedColumns.find((column) => column.id === source.columnId);

      if (!sourceColumn) {
        return previous;
      }

      const next: TasksByColumn = Object.fromEntries(
        Object.entries(previous).map(([columnId, tasks]) => [columnId, [...tasks]]),
      );

      if (overType === "task") {
        const target = findTaskLocation(String(over.id), next);

        if (!target) {
          return previous;
        }

        if (source.columnId === target.columnId) {
          if (source.index === target.index) {
            return previous;
          }

          next[source.columnId] = normalizeColumnTasks(
            arrayMove(next[source.columnId], source.index, target.index),
            sourceColumn,
          );

          return next;
        }

        const targetColumn = sortedColumns.find((column) => column.id === target.columnId);

        if (!targetColumn) {
          return previous;
        }

        const [movedTask] = next[source.columnId].splice(source.index, 1);

        next[source.columnId] = normalizeColumnTasks(next[source.columnId], sourceColumn);

        next[target.columnId].splice(target.index, 0, movedTask);
        next[target.columnId] = normalizeColumnTasks(next[target.columnId], targetColumn);

        return next;
      }

      if (overType === "column") {
        const targetColumnId = over.data.current?.columnId as string | undefined;

        if (!targetColumnId || targetColumnId === source.columnId) {
          return previous;
        }

        const targetColumn = sortedColumns.find((column) => column.id === targetColumnId);

        if (!targetColumn) {
          return previous;
        }

        const [movedTask] = next[source.columnId].splice(source.index, 1);

        next[source.columnId] = normalizeColumnTasks(next[source.columnId], sourceColumn);

        next[targetColumnId].push(movedTask);
        next[targetColumnId] = normalizeColumnTasks(next[targetColumnId], targetColumn);

        return next;
      }

      return previous;
    });
  };

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

  const { board } = boardQuery.data;

  return (
    <>
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
                  A task kártyák most már húzhatók. Ebben a lépésben a mozgatás még
                  frontend oldali, a következő lépésben mentjük adatbázisba is.
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

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <section className="grid gap-6 lg:grid-cols-3">
              {sortedColumns.map((column) => {
                const columnTasks = tasksByColumn[column.id] ?? [];

                return (
                  <TaskColumn
                    key={column.id}
                    columnId={column.id}
                    title={column.title}
                    count={columnTasks.length}
                    taskIds={columnTasks.map((task) => task.id)}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[rgba(100,108,255,0.2)] bg-[#242424] p-4 text-sm text-[rgba(255,255,255,0.6)]">
                        Húzz ide taskot, vagy hozz létre egy újat.
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                        />
                      ))
                    )}
                  </TaskColumn>
                );
              })}
            </section>
          </DndContext>
        </main>
      </div>

      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSaved={async () => {
          await queryClient.invalidateQueries({
            queryKey: ["board-detail", authUser?.id, boardId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["boards", authUser?.id],
          });
        }}
      />
    </>
  );
}

export default BoardDetailPage;
