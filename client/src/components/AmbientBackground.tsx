export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-ink/[0.04] blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-ink/[0.03] blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-ink/[0.03] blur-3xl" />
    </div>
  );
}