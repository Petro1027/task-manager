import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

type SortableTaskCardProps = {
  task: BoardTask;
  onClick: () => void;
};

function priorityBadgeClasses(priority: BoardTask["priority"]) {
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

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        task,
        columnId: task.columnId,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyles = priorityBadgeClasses(task.priority);

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className="rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5"
      title={task.title}
    >
      <div
        style={{
          borderRadius: "24px",
          border: "1px solid var(--panel-border)",
          background: "var(--surface-3)",
          padding: "0",
          boxShadow: isDragging ? "0 18px 40px rgba(0,0,0,0.22)" : "none",
          opacity: isDragging ? 0.72 : 1,
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {task.title}
            </h3>

            <span
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={priorityStyles}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--text-secondary)" }}
            >
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {task.category && (
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "var(--chip-bg)",
                  color: "var(--text-secondary)",
                }}
              >
                {task.category}
              </span>
            )}

            {task.dueDate && (
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: "var(--panel-border)",
                  background: "var(--chip-bg)",
                  color: "var(--text-secondary)",
                }}
              >
                {new Date(task.dueDate).toLocaleDateString("hu-HU")}
              </span>
            )}

            {task.taskTags.map((taskTag) => (
              <span
                key={taskTag.tag.id}
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: taskTag.tag.color }}
              >
                {taskTag.tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export default SortableTaskCard;
