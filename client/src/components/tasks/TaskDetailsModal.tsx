import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const taskEditSchema = z.object({
  title: z.string().trim().min(1, "A cím kötelező").max(200, "A cím túl hosszú"),
  description: z.string().trim().max(5000, "A leírás túl hosszú").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  category: z.string().trim().max(100, "A kategória túl hosszú").optional(),
  dueDate: z.string().optional(),
});

type TaskEditValues = z.infer<typeof taskEditSchema>;

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
    throw new Error("Hiányzik a hozzáférési token.");
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
    throw new Error("A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };

    throw new Error(errorData.message || "Nem sikerült menteni a taskot.");
  }

  return (await response.json()) as BoardTask;
}

function TaskDetailsModal({ task, onClose, onSaved }: TaskDetailsModalProps) {
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskEditValues>({
    resolver: zodResolver(taskEditSchema),
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
        setServerError(error.message);
      } else {
        setServerError("Nem sikerült menteni a taskot.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Task szerkesztése
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{task.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[rgba(100,108,255,0.25)] px-3 py-2 text-sm text-[rgba(255,255,255,0.78)] transition hover:border-[rgba(100,108,255,0.45)]"
          >
            Bezárás
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityBadgeClasses(task.priority)}`}
          >
            {task.priority}
          </span>

          <span className="rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-1 text-xs text-[rgba(255,255,255,0.78)]">
            {task.column.title}
          </span>

          {task.archived && (
            <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs text-slate-300">
              Archivált
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
              Cím
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
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
              rows={5}
              className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
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
              Határidő
            </label>
            <input
              type="datetime-local"
              {...register("dueDate")}
              className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
            />
            {errors.dueDate && (
              <p className="mt-2 text-sm text-red-400">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.82)]">
              Kategória
            </label>
            <input
              type="text"
              {...register("category")}
              className="w-full rounded-xl border border-[rgba(100,108,255,0.25)] bg-[#242424] px-4 py-3 outline-none transition focus:border-[#646cff]"
            />
            {errors.category && (
              <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
            )}
          </div>

          {serverError && (
            <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {serverError}
            </div>
          )}

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#646cff] px-5 py-3 font-medium text-white transition hover:bg-[#535bf2] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Mentés..." : "Mentés"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[rgba(100,108,255,0.25)] px-5 py-3 font-medium text-[rgba(255,255,255,0.82)] transition hover:border-[rgba(100,108,255,0.45)]"
            >
              Mégse
            </button>
          </div>
        </form>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#242424] p-5">
            <h3 className="text-lg font-medium">Meta adatok</h3>

            <div className="mt-4 space-y-3 text-sm text-[rgba(255,255,255,0.72)]">
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Task ID:</span> {task.id}
              </p>
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Pozíció:</span> {task.position}
              </p>
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Létrehozva:</span>{" "}
                {new Date(task.createdAt).toLocaleString("hu-HU")}
              </p>
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Frissítve:</span>{" "}
                {new Date(task.updatedAt).toLocaleString("hu-HU")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#242424] p-5">
            <h3 className="text-lg font-medium">Tagek</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {task.taskTags.length === 0 ? (
                <p className="text-sm text-[rgba(255,255,255,0.6)]">
                  Ehhez a taskhoz még nincs tag.
                </p>
              ) : (
                task.taskTags.map((taskTag) => (
                  <span
                    key={taskTag.tag.id}
                    className="rounded-full px-3 py-1 text-xs text-white"
                    style={{ backgroundColor: taskTag.tag.color }}
                  >
                    {taskTag.tag.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
