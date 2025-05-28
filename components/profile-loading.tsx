import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function ProfileLoading() {
  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Profile Card Loading */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-6 w-12 rounded-full" />
            </div>

            <div className="text-center md:text-left flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rank sections */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="space-y-2 min-h-[128px] flex flex-col justify-center flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator with spinner */}
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Spinner size="lg" />
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Loading profile data...</p>
          <p className="text-sm text-gray-500">Fetching summoner info and match history</p>
        </div>
      </div>
    </div>
  )
}
