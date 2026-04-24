import type { ReactNode } from "react";
import AppShell from "../layout/AppShell";
import SurfaceCard from "../ui/SurfaceCard";

type AuthPageShellProps = {
  badge: string;
  title: string;
  description: string;
  form: ReactNode;
  sideTitle: string;
  sideText: string;
  sideItems: string[];
};

function AuthPageShell({
                         badge,
                         title,
                         description,
                         form,
                         sideTitle,
                         sideText,
                         sideItems,
                       }: AuthPageShellProps) {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard>
          <span
            className="inline-flex rounded-full border px-3 py-1 text-sm font-medium"
            style={{
              borderColor: "var(--panel-border)",
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            {badge}
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>

          <p
            className="mt-4 max-w-2xl text-base leading-8 md:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>

          <div className="mt-8">{form}</div>
        </SurfaceCard>

        <SurfaceCard>
          <div
            className="rounded-[28px] border p-6"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--panel-border)",
            }}
          >
            <h2 className="text-2xl font-semibold">{sideTitle}</h2>

            <p className="mt-3 text-base leading-7" style={{ color: "var(--text-secondary)" }}>
              {sideText}
            </p>

            <ul
              className="mt-6 list-disc space-y-3 pl-5 text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              {sideItems.map((item) => (
                <li key={item} className="marker:text-[var(--accent)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

export default AuthPageShell;
