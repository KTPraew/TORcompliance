import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-8 h-14 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/60 dark:border-border">
      <h1 className="text-[15px] font-semibold text-slate-800 dark:text-foreground tracking-tight">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}
