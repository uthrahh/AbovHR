import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-20" />
      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-6 h-24 w-full" />
          <Skeleton className="mt-6 h-32 w-full" />
        </div>
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
