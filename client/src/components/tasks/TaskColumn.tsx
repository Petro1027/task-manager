import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

type TaskColumnProps = {
  columnId: string;
  title: string;
  count: number;
  taskIds: string[];
  children: ReactNode;
};

function TaskColumn({ columnId, title, count, taskIds, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnId}`,
    data: {
      type: "column",
      columnId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-[28px] border p-5 transition"
      style={{
        background: "var(--surface-2)",
        borderColor: isOver ? "var(--accent)" : "var(--panel-border)",
        boxShadow: "var(--panel-shadow)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>

        <span
          className="rounded-full border px-3 py-1 text-xs font-medium"
          style={{
            borderColor: "var(--panel-border)",
            background: "var(--chip-bg)",
            color: "var(--text-secondary)",
          }}
        >
          {count} task
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="mt-5 flex min-h-[120px] flex-col gap-4">{children}</div>
      </SortableContext>
    </div>
  );
}

export default TaskColumn;
