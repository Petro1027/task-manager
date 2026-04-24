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
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "MEDIUM":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "LOW":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-[rgba(100,108,255,0.25)] bg-[#242424] text-[rgba(255,255,255,0.75)]";
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

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className={`rounded-2xl border border-[rgba(100,108,255,0.18)] bg-[#242424] p-4 text-left transition hover:border-[rgba(100,108,255,0.35)] hover:bg-[#2a2a2a] ${
        isDragging ? "opacity-60 shadow-2xl" : ""
      }`}
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
    </button>
  );
}

export default SortableTaskCard;
