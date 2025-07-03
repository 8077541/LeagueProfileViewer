"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getRateLimitStatus } from "@/lib/riot"

export function DebugPanel() {
  const [rateLimitStatus, setRateLimitStatus] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  const refreshStatus = () => {
    const status = getRateLimitStatus()
    setRateLimitStatus(status)
  }

  useEffect(() => {
    if (isVisible) {
      refreshStatus()
      const interval = setInterval(refreshStatus, 1000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="mb-2">
        {isVisible ? "Hide" : "Show"} Debug
      </Button>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader>
            <CardTitle className="text-sm">API Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Rate Limit Status</h4>
              {Object.entries(rateLimitStatus).map(([region, status]: [string, any]) => (
                <div key={region} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{region.toUpperCase()}</span>
                    <Badge variant={status.canMakeRequest ? "default" : "destructive"}>
                      {status.canMakeRequest ? "OK" : "Limited"}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      Key: {status.currentKey}/{status.totalKeys}
                    </div>
                    <div>Requests (1s): {status.requestsInLastSecond}/20</div>
                    <div>Requests (2m): {status.requestsInLast2Minutes}/100</div>
                    {status.waitTime > 0 && <div>Wait: {Math.ceil(status.waitTime / 1000)}s</div>}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-2">Environment</h4>
              <div className="text-xs space-y-1">
                <div>Node ENV: {process.env.NODE_ENV}</div>
                <div>
                  API Keys: {process.env.RIOT_API_KEY ? "✅" : "❌"} / {process.env.RIOT_API_KEY_2 ? "✅" : "❌"}
                </div>
              </div>
            </div>

            <Button onClick={refreshStatus} size="sm" className="w-full">
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
