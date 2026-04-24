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
};

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

function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
  if (!task) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[rgba(100,108,255,0.25)] bg-[#1a1a1a] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#646cff]">
              Task részletek
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

          {task.category && (
            <span className="rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-1 text-xs text-[rgba(255,255,255,0.78)]">
              {task.category}
            </span>
          )}

          {task.dueDate && (
            <span className="rounded-full border border-[rgba(100,108,255,0.2)] bg-[#242424] px-3 py-1 text-xs text-[rgba(255,255,255,0.78)]">
              Határidő: {new Date(task.dueDate).toLocaleDateString("hu-HU")}
            </span>
          )}

          {task.archived && (
            <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs text-slate-300">
              Archivált
            </span>
          )}
        </div>

        <section className="mt-6 rounded-2xl bg-[#242424] p-5">
          <h3 className="text-lg font-medium">Leírás</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[rgba(255,255,255,0.72)]">
            {task.description || "Nincs leírás megadva ehhez a taskhoz."}
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#242424] p-5">
            <h3 className="text-lg font-medium">Meta adatok</h3>

            <div className="mt-4 space-y-3 text-sm text-[rgba(255,255,255,0.72)]">
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Task ID:</span>{" "}
                {task.id}
              </p>
              <p>
                <span className="text-[rgba(255,255,255,0.5)]">Pozíció:</span>{" "}
                {task.position}
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

        <div className="mt-6 rounded-2xl border border-dashed border-[rgba(100,108,255,0.2)] bg-[#242424] p-4 text-sm text-[rgba(255,255,255,0.68)]">
          Következő lépésben ide kötjük be a task szerkesztést, hogy a modálból
          módosítani is lehessen az adatokat.
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
