export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <div className="h-4 w-36 animate-pulse rounded-full bg-[#eadbd6]" />
      <div className="mt-4 h-14 max-w-xl animate-pulse rounded-2xl bg-[#eadbd6]" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-[1.4rem] bg-[#f1e7e2]" />
            <div className="mt-4 h-4 w-24 animate-pulse rounded bg-[#eadbd6]" />
            <div className="mt-3 h-6 w-4/5 animate-pulse rounded bg-[#eadbd6]" />
          </div>
        ))}
      </div>
    </div>
  );
}
