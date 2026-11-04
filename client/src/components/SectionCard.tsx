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
  iconColor = '#18181B',
  title,
  description,
  children,
  action,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/80 bg-zinc-50"
          >
            <Icon size={18} color={iconColor} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-950 text-base tracking-tight">
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
