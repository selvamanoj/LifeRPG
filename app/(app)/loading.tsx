export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading the keep">
      <div className="panel h-40 animate-pulse" />
      <div className="panel h-64 animate-pulse" />
    </div>
  );
}
