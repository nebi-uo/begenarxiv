import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 text-zinc-900">
            <Icon size={14} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-950 text-sm tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-zinc-500 text-xs mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
