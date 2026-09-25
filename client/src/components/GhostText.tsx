export default function GhostText({ children }: { children: string }) {
  return (
    <span
      className="absolute select-none pointer-events-none text-white/10 font-medium whitespace-nowrap"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(6rem, 20vw, 14rem)',
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}