import type { ReactNode } from "react";

type PageContainerProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PageContainer({ title, description, action, children }: PageContainerProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-zinc-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </main>
  );
}

export default PageContainer;
