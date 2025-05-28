"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface ProfilePageWrapperProps {
  children: React.ReactNode
}

export function ProfilePageWrapper({ children }: ProfilePageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState({
    account: false,
    rank: false,
    matches: false,
    stats: false,
  })
  const params = useParams()

  const username = params?.username as string
  const tag = params?.tag as string
  const region = params?.region as string

  useEffect(() => {
    // Simulate loading steps with realistic timing
    const steps = [
      { key: "account", delay: 500 },
      { key: "rank", delay: 800 },
      { key: "matches", delay: 1200 },
      { key: "stats", delay: 1500 },
    ]

    steps.forEach(({ key, delay }) => {
      setTimeout(() => {
        setLoadingSteps((prev) => ({ ...prev, [key]: true }))
      }, delay)
    })

    // Complete loading after all steps
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (isLoading) {
    return <ProfileLoadingSpinnerWithSteps username={username} tag={tag} region={region} loadingSteps={loadingSteps} />
  }

  return <>{children}</>
}

interface ProfileLoadingSpinnerWithStepsProps {
  username?: string
  tag?: string
  region?: string
  loadingSteps: {
    account: boolean
    rank: boolean
    matches: boolean
    stats: boolean
  }
}

function ProfileLoadingSpinnerWithSteps({ username, tag, region, loadingSteps }: ProfileLoadingSpinnerWithStepsProps) {
  const steps = [
    { key: "account", label: "Fetching account information", completed: loadingSteps.account },
    { key: "rank", label: "Loading rank data", completed: loadingSteps.rank },
    { key: "matches", label: "Fetching match history", completed: loadingSteps.matches },
    { key: "stats", label: "Loading game statistics", completed: loadingSteps.stats },
  ]

  const completedSteps = Object.values(loadingSteps).filter(Boolean).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-md bg-gray-200 animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Main Loading Card */}
      <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Large Spinner with Progress Ring */}
            <div className="relative">
              <div className="w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                    className="text-blue-600 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="lg" className="border-t-blue-600" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-800">
                Loading Profile
                {username && tag && (
                  <span className="text-blue-600">
                    {" "}
                    for {username}#{tag}
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                <p className="text-lg text-gray-600">
                  {completedSteps === 0 && "Connecting to Riot API..."}
                  {completedSteps === 1 && "Fetching summoner data..."}
                  {completedSteps === 2 && "Loading ranked information..."}
                  {completedSteps === 3 && "Processing match history..."}
                  {completedSteps === 4 && "Finalizing profile..."}
                </p>
                {region && (
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                    Region: {region.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-500">{completedSteps}/4 steps</span>
              </div>

              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 p-2 rounded-md transition-all duration-300 ${
                      step.completed
                        ? "bg-green-100 border border-green-200"
                        : index === completedSteps
                          ? "bg-blue-100 border border-blue-200"
                          : "bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        step.completed
                          ? "bg-green-600"
                          : index === completedSteps
                            ? "bg-blue-600 animate-pulse"
                            : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm transition-all duration-300 ${
                        step.completed
                          ? "text-green-800 font-medium"
                          : index === completedSteps
                            ? "text-blue-800"
                            : "text-gray-600"
                      }`}
                    >
                      {step.label}
                      {step.completed && <span className="ml-2 text-green-600">✓</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center text-xs text-gray-500 max-w-md">
              <p>This may take a few moments due to Riot API rate limits and data processing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
