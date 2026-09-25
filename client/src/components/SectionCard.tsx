import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  children: ReactNode;
}

export default function SectionCard({ icon: Icon, iconColor = '#FFFFFF', title, children }: Props) {
  return (
    <div className="liquid-glass rounded-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${iconColor}33` }}
        >
          <Icon size={16} color={iconColor} />
        </div>
        <h3 className="text-white font-medium" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}