import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl">Summoner not found</p>
        <p className="text-gray-500">
          The summoner you're looking for doesn't exist or there was an error fetching their data.
        </p>
        <Button asChild>
          <Link href="/">Return to Search</Link>
        </Button>
      </div>
    </div>
  )
}
