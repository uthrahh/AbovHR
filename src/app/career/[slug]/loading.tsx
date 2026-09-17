import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-8 w-1/2" />
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
