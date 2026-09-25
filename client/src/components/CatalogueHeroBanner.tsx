export default function CatalogueHeroBanner() {
  return (
    <div className="relative rounded-card overflow-hidden h-48 md:h-64 mb-8">
      <img
        src="../begena-catalogue.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <span className="text-xs uppercase tracking-widest text-white/70 font-medium mb-2">
          Begenarxiv
        </span>
        <h1
          className="text-3xl md:text-4xl text-white font-medium"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Explore the catalogue
        </h1>
      </div>
    </div>
  );
}