"use client"

import { useState } from "react"
import { Download, FileText, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { exportToJSON, exportToCSV } from "@/lib/export"

interface ExportButtonProps {
  matches: any[]
  puuid: string
  summonerName: string
  disabled?: boolean
}

export function ExportButton({ matches, puuid, summonerName, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExportJSON = async () => {
    if (matches.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no matches to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      exportToJSON(matches, puuid, summonerName)
      toast({
        title: "Export successful",
        description: `Exported ${matches.length} matches as JSON file.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export match history as JSON. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    if (matches.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no matches to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      exportToCSV(matches, puuid, summonerName)
      toast({
        title: "Export successful",
        description: `Exported ${matches.length} matches as CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export match history as CSV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || matches.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON} disabled={isExporting}>
          <Database className="h-4 w-4 mr-2" />
          Export as JSON
          <span className="ml-auto text-xs text-gray-500">({matches.length} matches)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
          <span className="ml-auto text-xs text-gray-500">({matches.length} matches)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
