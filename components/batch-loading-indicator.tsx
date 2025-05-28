"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"

interface BatchLoadingIndicatorProps {
  currentBatch: number
  totalBatches: number
  currentMatch: number
  totalMatches: number
  isVisible: boolean
}

export function BatchLoadingIndicator({
  currentBatch,
  totalBatches,
  currentMatch,
  totalMatches,
  isVisible,
}: BatchLoadingIndicatorProps) {
  if (!isVisible) return null

  const batchProgress = totalBatches > 0 ? (currentBatch / totalBatches) * 100 : 0
  const matchProgress = totalMatches > 0 ? (currentMatch / totalMatches) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Loading Match History</h3>
              <p className="text-sm text-gray-600">Fetching match details from Riot API...</p>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Batch Progress</span>
                  <span>
                    {currentBatch} / {totalBatches}
                  </span>
                </div>
                <Progress value={batchProgress} className="w-full" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Matches Loaded</span>
                  <span>
                    {currentMatch} / {totalMatches}
                  </span>
                </div>
                <Progress value={matchProgress} className="w-full" />
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">This may take a few moments due to API rate limits</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
