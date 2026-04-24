import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <section
      className={`rounded-[30px] border p-6 md:p-8 ${className}`.trim()}
      style={{
        background: "var(--surface-1)",
        borderColor: "var(--panel-border)",
        boxShadow: "var(--panel-shadow)",
      }}
    >
      {children}
    </section>
  );
}

export default SurfaceCard;
