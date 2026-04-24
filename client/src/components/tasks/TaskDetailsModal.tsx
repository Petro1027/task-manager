import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLanguage } from "../../app/language-context";
import { apiUrl } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";

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

type TaskDetailsModalProps = {
  task: BoardTask | null;
  onClose: () => void;
  onSaved: (updatedTask: BoardTask) => Promise<void> | void;
};

type TaskEditValues = {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  dueDate?: string;
};

function priorityBadgeStyles(priority: BoardTask["priority"]) {
  switch (priority) {
    case "HIGH":
      return {
        borderColor: "rgba(239,68,68,0.28)",
        background: "rgba(239,68,68,0.12)",
        color: "#fca5a5",
      };
    case "MEDIUM":
      return {
        borderColor: "rgba(245,158,11,0.28)",
        background: "rgba(245,158,11,0.12)",
        color: "#fcd34d",
      };
    case "LOW":
      return {
        borderColor: "rgba(16,185,129,0.28)",
        background: "rgba(16,185,129,0.12)",
        color: "#86efac",
      };
    default:
      return {
        borderColor: "var(--panel-border)",
        background: "var(--chip-bg)",
        color: "var(--text-secondary)",
      };
  }
}

function formatDateTimeLocal(dateValue: string | null) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function updateTaskRequest(taskId: string, values: TaskEditValues) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token.");
  }

  const response = await fetch(apiUrl(`/api/tasks/${taskId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: values.title.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      priority: values.priority,
      category: values.category?.trim() ? values.category.trim() : null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    }),
  });

  if (response.status === 401) {
    throw new Error("Session expired or invalid.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message || "Failed to save task.");
  }

  return (await response.json()) as BoardTask;
}

function TaskDetailsModal({ task, onClose, onSaved }: TaskDetailsModalProps) {
  const { language } = useLanguage();
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const copy =
    language === "hu"
      ? {
        badge: "Task szerkesztése",
        close: "Bezárás",
        title: "Cím",
        description: "Leírás",
        priority: "Prioritás",
        dueDate: "Határidő",
        category: "Kategória",
        save: "Mentés",
        saving: "Mentés...",
        cancel: "Mégse",
        meta: "Meta adatok",
        tags: "Tagek",
        noTags: "Ehhez a taskhoz még nincs tag.",
        noDescription: "Nincs leírás megadva ehhez a taskhoz.",
        archived: "Archivált",
        taskId: "Task ID",
        position: "Pozíció",
        createdAt: "Létrehozva",
        updatedAt: "Frissítve",
        column: "Oszlop",
        titleRequired: "A cím kötelező.",
        titleTooLong: "A cím túl hosszú.",
        descriptionTooLong: "A leírás túl hosszú.",
        categoryTooLong: "A kategória túl hosszú.",
        missingToken: "Hiányzik a hozzáférési token.",
        sessionExpired: "A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.",
        saveFallback: "Nem sikerült menteni a taskot.",
      }
      : {
        badge: "Edit task",
        close: "Close",
        title: "Title",
        description: "Description",
        priority: "Priority",
        dueDate: "Due date",
        category: "Category",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        meta: "Meta data",
        tags: "Tags",
        noTags: "There are no tags on this task yet.",
        noDescription: "No description has been added for this task.",
        archived: "Archived",
        taskId: "Task ID",
        position: "Position",
        createdAt: "Created at",
        updatedAt: "Updated at",
        column: "Column",
        titleRequired: "Title is required.",
        titleTooLong: "Title is too long.",
        descriptionTooLong: "Description is too long.",
        categoryTooLong: "Category is too long.",
        missingToken: "Missing access token.",
        sessionExpired: "Session expired or invalid. Please sign in again.",
        saveFallback: "Failed to save task.",
      };

  const localizedSchema = z.object({
    title: z.string().trim().min(1, copy.titleRequired).max(200, copy.titleTooLong),
    description: z.string().trim().max(5000, copy.descriptionTooLong).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    category: z.string().trim().max(100, copy.categoryTooLong).optional(),
    dueDate: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskEditValues>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      category: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (!task) {
      return;
    }

    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      category: task.category ?? "",
      dueDate: formatDateTimeLocal(task.dueDate),
    });

    setServerError("");
  }, [reset, task]);

  if (!task) {
    return null;
  }

  const onSubmit = async (values: TaskEditValues) => {
    setServerError("");
    setIsSaving(true);

    try {
      const updatedTask = await updateTaskRequest(task.id, values);
      await onSaved(updatedTask);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Missing access token.") {
          setServerError(copy.missingToken);
        } else if (error.message === "Session expired or invalid.") {
          setServerError(copy.sessionExpired);
        } else if (error.message === "Failed to save task.") {
          setServerError(copy.saveFallback);
        } else {
          setServerError(error.message);
        }
      } else {
        setServerError(copy.saveFallback);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const priorityStyles = priorityBadgeStyles(task.priority);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border p-6 md:p-8"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--panel-border)",
          boxShadow: "var(--panel-shadow)",
        }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              {copy.badge}
            </p>

            <h2 className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {task.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={priorityStyles}
              >
                {task.priority}
              </span>

              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "var(--chip-bg)",
                  color: "var(--text-secondary)",
                }}
              >
                {copy.column}: {task.column.title}
              </span>

              {task.archived && (
                <span
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: "var(--panel-border)",
                    background: "var(--chip-bg)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {copy.archived}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-3 text-sm font-medium transition hover:opacity-90"
            style={{
              borderColor: "var(--panel-border)",
              background: "var(--chip-bg)",
              color: "var(--text-primary)",
            }}
          >
            {copy.close}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div
            className="rounded-[28px] border p-6"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--panel-border)",
            }}
          >
            <div className="grid gap-5">
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
                  rows={6}
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
                    {copy.dueDate}
                  </label>
                  <input
                    type="datetime-local"
                    {...register("dueDate")}
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                    style={{
                      borderColor: "var(--panel-border)",
                      background: "var(--surface-3)",
                      color: "var(--text-primary)",
                    }}
                  />
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

              {serverError && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "rgba(239, 68, 68, 0.28)",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#fca5a5",
                  }}
                >
                  {serverError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%)",
                  }}
                >
                  {isSaving ? copy.saving : copy.save}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    borderColor: "var(--panel-border)",
                    background: "var(--chip-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div
              className="rounded-[28px] border p-6"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--panel-border)",
              }}
            >
              <h3 className="text-xl font-semibold">{copy.meta}</h3>

              <div className="mt-5 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <p>
                  <span style={{ color: "var(--text-muted)" }}>{copy.taskId}:</span>{" "}
                  {task.id}
                </p>
                <p>
                  <span style={{ color: "var(--text-muted)" }}>{copy.position}:</span>{" "}
                  {task.position}
                </p>
                <p>
                  <span style={{ color: "var(--text-muted)" }}>{copy.createdAt}:</span>{" "}
                  {new Date(task.createdAt).toLocaleString(language === "hu" ? "hu-HU" : "en-GB")}
                </p>
                <p>
                  <span style={{ color: "var(--text-muted)" }}>{copy.updatedAt}:</span>{" "}
                  {new Date(task.updatedAt).toLocaleString(language === "hu" ? "hu-HU" : "en-GB")}
                </p>
              </div>
            </div>

            <div
              className="rounded-[28px] border p-6"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--panel-border)",
              }}
            >
              <h3 className="text-xl font-semibold">{copy.tags}</h3>

              <div className="mt-5 flex flex-wrap gap-2">
                {task.taskTags.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {copy.noTags}
                  </p>
                ) : (
                  task.taskTags.map((taskTag) => (
                    <span
                      key={taskTag.tag.id}
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: taskTag.tag.color }}
                    >
                      {taskTag.tag.name}
                    </span>
                  ))
                )}
              </div>

              {!task.description && (
                <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
                  {copy.noDescription}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
