import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="min-h-screen px-4 py-8 md:px-6"
      style={{
        color: "var(--text-primary)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-16 top-20 h-56 w-56 rounded-full blur-3xl md:h-72 md:w-72"
          style={{ background: "var(--glow-1)" }}
        />
        <div
          className="absolute right-[-60px] top-24 h-64 w-64 rounded-full blur-3xl md:h-80 md:w-80"
          style={{ background: "var(--glow-2)" }}
        />
        <div
          className="absolute bottom-[-60px] left-1/3 h-56 w-56 rounded-full blur-3xl md:h-72 md:w-72"
          style={{ background: "var(--glow-3)" }}
        />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        {children}
      </main>
    </div>
  );
}

export default AppShell;
