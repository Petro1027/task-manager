import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../app/auth-context";
import { useLanguage } from "../app/language-context";
import AppShell from "../components/layout/AppShell";
import SortableTaskCard from "../components/tasks/SortableTaskCard";
import TaskColumn from "../components/tasks/TaskColumn";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal";
import SurfaceCard from "../components/ui/SurfaceCard";
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

type CreateTaskValues = {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  columnKey: "TODO" | "IN_PROGRESS" | "DONE";
};

async function fetchBoardDetail(boardId: string) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token.");
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
    throw new Error("Session expired or invalid.");
  }

  if (boardResponse.status === 404) {
    throw new Error("Board not found.");
  }

  if (!boardResponse.ok) {
    const errorData = (await boardResponse.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to load board.");
  }

  if (!tasksResponse.ok) {
    const errorData = (await tasksResponse.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to load tasks.");
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
    throw new Error("Missing access token.");
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
    throw new Error("Session expired or invalid.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to create task.");
  }

  return (await response.json()) as BoardTask;
}

async function moveTaskRequest(input: {
  taskId: string;
  columnKey: "TODO" | "IN_PROGRESS" | "DONE";
  position: number;
}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token.");
  }

  const response = await fetch(apiUrl(`/api/tasks/${input.taskId}/move`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      columnKey: input.columnKey,
      position: input.position,
    }),
  });

  if (response.status === 401) {
    throw new Error("Session expired or invalid.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to save task move.");
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
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});

  const copy =
    language === "hu"
      ? {
        badge: "Board részletek",
        loadingTitle: "Session ellenőrzése",
        loadingText: "Betöltjük a bejelentkezési állapotot...",
        boardLoading: "Board részletek betöltése...",
        boardError: "Hiba történt a board betöltése közben.",
        boardNotFound: "A board nem található.",
        back: "Vissza a boardokhoz",
        overview: "Áttekintés",
        taskCreateTitle: "Új task létrehozása",
        taskCreateText: "Itt közvetlenül a boardon belül tudsz új taskot létrehozni.",
        title: "Cím",
        description: "Leírás",
        priority: "Prioritás",
        column: "Oszlop",
        category: "Kategória",
        createTask: "Task létrehozása",
        creatingTask: "Létrehozás...",
        createTaskSuccess: "A task sikeresen létrejött.",
        createTaskFallback: "Nem sikerült létrehozni a taskot.",
        moveTaskFallback: "Nem sikerült menteni a task mozgatását.",
        titleRequired: "A task címe kötelező.",
        titleTooLong: "A task címe túl hosszú.",
        descriptionTooLong: "A leírás túl hosszú.",
        categoryTooLong: "A kategória túl hosszú.",
        missingToken: "Hiányzik a hozzáférési token.",
        sessionExpired: "A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.",
        tasks: "Taskok",
        tags: "Tagek",
        boardInfo: "Board információk",
        columnsLabel: "Oszlopok",
        dragHint: "Húzd a taskokat oszlopok között, vagy rendezd át őket oszlopon belül.",
        emptyColumn: "Húzz ide taskot, vagy hozz létre egy újat.",
        placeholderTitle: "Például: API dokumentáció frissítése",
        placeholderDescription: "Rövid leírás a taskhoz",
        placeholderCategory: "Például: Backend",
        todo: "To Do",
        inProgress: "In Progress",
        done: "Done",
        activeProfile: "Aktív profil",
      }
      : {
        badge: "Board details",
        loadingTitle: "Checking session",
        loadingText: "Loading authentication state...",
        boardLoading: "Loading board details...",
        boardError: "An error occurred while loading the board.",
        boardNotFound: "Board not found.",
        back: "Back to boards",
        overview: "Overview",
        taskCreateTitle: "Create a new task",
        taskCreateText: "You can create a new task directly inside this board.",
        title: "Title",
        description: "Description",
        priority: "Priority",
        column: "Column",
        category: "Category",
        createTask: "Create task",
        creatingTask: "Creating...",
        createTaskSuccess: "Task created successfully.",
        createTaskFallback: "Failed to create task.",
        moveTaskFallback: "Failed to persist task move.",
        titleRequired: "Task title is required.",
        titleTooLong: "Task title is too long.",
        descriptionTooLong: "Description is too long.",
        categoryTooLong: "Category is too long.",
        missingToken: "Missing access token.",
        sessionExpired: "Session expired or invalid. Please sign in again.",
        tasks: "Tasks",
        tags: "Tags",
        boardInfo: "Board information",
        columnsLabel: "Columns",
        dragHint: "Drag tasks between columns or reorder them inside a column.",
        emptyColumn: "Drop a task here, or create a new one.",
        placeholderTitle: "For example: Update API documentation",
        placeholderDescription: "Short task description",
        placeholderCategory: "For example: Backend",
        todo: "To Do",
        inProgress: "In Progress",
        done: "Done",
        activeProfile: "Active profile",
      };

  const localizedTaskSchema = z.object({
    title: z.string().trim().min(1, copy.titleRequired).max(200, copy.titleTooLong),
    description: z.string().trim().max(5000, copy.descriptionTooLong).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    category: z.string().trim().max(100, copy.categoryTooLong).optional(),
    columnKey: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  });

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
    resolver: zodResolver(localizedTaskSchema),
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
    mutationFn: async (values: CreateTaskValues) => {
      try {
        return await createTaskRequest({
          boardId: boardId ?? "",
          values,
        });
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

        if (error.message === "Failed to create task.") {
          throw new Error(copy.createTaskFallback);
        }

        throw error;
      }
    },
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

  const moveTaskMutation = useMutation({
    mutationFn: async (values: {
      taskId: string;
      columnKey: "TODO" | "IN_PROGRESS" | "DONE";
      position: number;
    }) => {
      try {
        return await moveTaskRequest(values);
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

        if (error.message === "Failed to save task move.") {
          throw new Error(copy.moveTaskFallback);
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["board-detail", authUser?.id, boardId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["boards", authUser?.id],
      });
    },
    onError: async () => {
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

    const source = findTaskLocation(activeId, tasksByColumn);

    if (!source) {
      return;
    }

    const sourceColumn = sortedColumns.find((columnItem) => columnItem.id === source.columnId);

    if (!sourceColumn) {
      return;
    }

    let targetColumnId: string | null = null;
    let targetPosition = 0;

    if (overType === "task") {
      const target = findTaskLocation(String(over.id), tasksByColumn);

      if (!target) {
        return;
      }

      if (source.columnId === target.columnId && source.index === target.index) {
        return;
      }

      targetColumnId = target.columnId;
      targetPosition = target.index;
    } else if (overType === "column") {
      const dropColumnId = over.data.current?.columnId as string | undefined;

      if (!dropColumnId) {
        return;
      }

      if (dropColumnId === source.columnId) {
        return;
      }

      targetColumnId = dropColumnId;
      targetPosition = tasksByColumn[dropColumnId]?.length ?? 0;
    } else {
      return;
    }

    const targetColumn = sortedColumns.find((columnItem) => columnItem.id === targetColumnId);

    if (!targetColumn) {
      return;
    }

    setTasksByColumn((previous) => {
      const latestSource = findTaskLocation(activeId, previous);

      if (!latestSource) {
        return previous;
      }

      const next: TasksByColumn = Object.fromEntries(
        Object.entries(previous).map(([columnId, tasks]) => [columnId, [...tasks]]),
      );

      if (latestSource.columnId === targetColumnId) {
        next[latestSource.columnId] = normalizeColumnTasks(
          arrayMove(next[latestSource.columnId], latestSource.index, targetPosition),
          sourceColumn,
        );

        return next;
      }

      const latestTargetColumn = sortedColumns.find(
        (columnItem) => columnItem.id === targetColumnId,
      );

      if (!latestTargetColumn) {
        return previous;
      }

      const [movedTask] = next[latestSource.columnId].splice(latestSource.index, 1);

      next[latestSource.columnId] = normalizeColumnTasks(
        next[latestSource.columnId],
        sourceColumn,
      );

      next[targetColumnId].splice(targetPosition, 0, movedTask);
      next[targetColumnId] = normalizeColumnTasks(next[targetColumnId], latestTargetColumn);

      return next;
    });

    moveTaskMutation.mutate({
      taskId: activeId,
      columnKey: targetColumn.key,
      position: targetPosition,
    });
  };

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

  if (!boardId) {
    return <Navigate to="/boards" replace />;
  }

  if (boardQuery.isLoading) {
    return (
      <AppShell>
        <SurfaceCard>
          <p
            className="text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--accent)" }}
          >
            {copy.badge}
          </p>
          <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            {copy.boardLoading}
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  if (boardQuery.isError) {
    return (
      <AppShell>
        <SurfaceCard>
          <Link
            to="/boards"
            className="text-sm font-medium transition hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            ← {copy.back}
          </Link>

          <p className="mt-5 text-lg font-semibold">{copy.boardError}</p>
          <p className="mt-2 text-sm text-red-400">{boardQuery.error.message}</p>
        </SurfaceCard>
      </AppShell>
    );
  }

  if (!boardQuery.data) {
    return (
      <AppShell>
        <SurfaceCard>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            {copy.boardNotFound}
          </p>
        </SurfaceCard>
      </AppShell>
    );
  }

  const { board } = boardQuery.data;

  return (
    <>
      <AppShell>
        <SurfaceCard>
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <Link
                to="/boards"
                className="text-sm font-medium transition hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                ← {copy.back}
              </Link>

              <span
                className="mt-5 inline-flex rounded-full border px-3 py-1 text-sm font-medium"
                style={{
                  borderColor: "var(--panel-border)",
                  backgroundColor: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {copy.badge}
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                {board.title}
              </h1>

              <p
                className="mt-4 max-w-2xl text-base leading-8 md:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                {copy.dragHint}
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
                {copy.activeProfile}
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
                  <p
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {copy.tasks}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{board._count.tasks}</p>
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
                  <p className="mt-2 text-2xl font-semibold">{board._count.tags}</p>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard>
            <h2 className="text-2xl font-semibold">{copy.taskCreateTitle}</h2>
            <p className="mt-3 text-base leading-7" style={{ color: "var(--text-secondary)" }}>
              {copy.taskCreateText}
            </p>

            <form
              onSubmit={handleSubmit((values) => createTaskMutation.mutate(values))}
              className="mt-6 flex flex-col gap-5"
            >
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.title}
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder={copy.placeholderTitle}
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

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.description}
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder={copy.placeholderDescription}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{
                    borderColor: "var(--panel-border)",
                    background: "var(--surface-3)",
                    color: "var(--text-primary)",
                  }}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {copy.priority}
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                    style={{
                      borderColor: "var(--panel-border)",
                      background: "var(--surface-3)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {copy.column}
                  </label>
                  <select
                    {...register("columnKey")}
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                    style={{
                      borderColor: "var(--panel-border)",
                      background: "var(--surface-3)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="TODO">{copy.todo}</option>
                    <option value="IN_PROGRESS">{copy.inProgress}</option>
                    <option value="DONE">{copy.done}</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {copy.category}
                </label>
                <input
                  type="text"
                  {...register("category")}
                  placeholder={copy.placeholderCategory}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{
                    borderColor: "var(--panel-border)",
                    background: "var(--surface-3)",
                    color: "var(--text-primary)",
                  }}
                />
                {errors.category && (
                  <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
                )}
              </div>

              {createTaskMutation.isError && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "rgba(239, 68, 68, 0.28)",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#fca5a5",
                  }}
                >
                  {createTaskMutation.error.message}
                </div>
              )}

              {createTaskMutation.isSuccess && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--success-border)",
                    background: "var(--success-soft)",
                    color: "#86efac",
                  }}
                >
                  {copy.createTaskSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                }}
              >
                {createTaskMutation.isPending ? copy.creatingTask : copy.createTask}
              </button>
            </form>
          </SurfaceCard>

          <SurfaceCard>
            <h2 className="text-2xl font-semibold">{copy.boardInfo}</h2>
            <p className="mt-3 text-base leading-7" style={{ color: "var(--text-secondary)" }}>
              {copy.overview}
            </p>

            <div
              className="mt-6 rounded-[28px] border p-5"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--panel-border)",
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--accent)" }}
              >
                {copy.columnsLabel}
              </p>

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

            {moveTaskMutation.isError && (
              <div
                className="mt-5 rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "rgba(239, 68, 68, 0.28)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                }}
              >
                {moveTaskMutation.error.message}
              </div>
            )}
          </SurfaceCard>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <section className="grid gap-6 xl:grid-cols-3">
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
                    <div
                      className="rounded-[24px] border border-dashed p-4 text-sm"
                      style={{
                        borderColor: "var(--panel-border)",
                        background: "var(--surface-3)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {copy.emptyColumn}
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
      </AppShell>

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
