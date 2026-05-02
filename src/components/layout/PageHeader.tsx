import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 hidden md:flex items-center justify-between px-8 h-14 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <h1 className="text-[15px] font-semibold text-slate-900">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}
