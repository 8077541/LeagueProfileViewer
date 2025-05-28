import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface MatchesLoadingProps {
  showHeader?: boolean
  count?: number
}

export function MatchesLoading({ showHeader = true, count = 5 }: MatchesLoadingProps) {
  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-gray-300 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
                {/* Game info */}
                <div className="flex-none w-32 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>

                {/* Champion and spells */}
                <div className="flex-none flex items-center gap-1">
                  <div className="relative">
                    <Skeleton className="h-12 w-12 rounded" />
                    <Skeleton className="absolute -bottom-1 -right-1 h-4 w-6 rounded" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>

                {/* KDA */}
                <div className="flex-none w-28 text-center space-y-1">
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>

                {/* Items */}
                <div className="flex-none flex flex-wrap gap-1 justify-center min-w-[220px]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-8 rounded" />
                  ))}
                </div>

                {/* Players */}
                <div className="flex-grow flex gap-8">
                  {/* Blue Team */}
                  <div className="flex-1 space-y-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>

                  {/* Red Team */}
                  <div className="flex-1 space-y-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expand button */}
                <div className="flex-none">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!showHeader && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-gray-600">Loading more matches...</span>
          </div>
        </div>
      )}
    </div>
  )
}
