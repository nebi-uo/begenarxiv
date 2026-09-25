export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        src="../begena-hero.png"
        alt=""
        aria-hidden="true"
        className="w-full h-full object-cover scale-110"
        style={{ filter: 'blur(40px) brightness(0.55) saturate(120%)' }}
      />
      {/* Extra dark scrim on top for guaranteed text/glass contrast, regardless
          of how bright any given region of the source photo is */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}