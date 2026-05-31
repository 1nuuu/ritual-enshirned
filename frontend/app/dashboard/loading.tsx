export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-mystic" />
        <p className="font-display text-sm text-foreground/40">Loading...</p>
      </div>
    </div>
  );
}
