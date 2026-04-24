import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
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
      className={`rounded-3xl border bg-[#1a1a1a] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition ${
        isOver
          ? "border-[#646cff]"
          : "border-[rgba(100,108,255,0.2)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="rounded-full border border-[rgba(100,108,255,0.2)] px-3 py-1 text-xs text-[rgba(255,255,255,0.72)]">
          {count} task
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="mt-5 flex min-h-[120px] flex-col gap-4">
          {children}
        </div>
      </SortableContext>
    </div>
  );
}

export default TaskColumn;
