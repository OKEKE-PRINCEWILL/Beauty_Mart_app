export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12" aria-label="Loading page">
      <div className="h-3 w-28 animate-pulse rounded-full bg-[#eadbd6]" />
      <div className="mt-5 h-14 max-w-xl animate-pulse rounded-2xl bg-[#eee2dd]" />
      <div className="mt-4 h-4 max-w-md animate-pulse rounded-full bg-[#f0e7e3]" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-[#f1e7e2]" />
        ))}
      </div>
    </div>
  );
}
