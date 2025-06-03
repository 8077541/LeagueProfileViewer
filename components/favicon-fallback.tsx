"use client"

import { useEffect } from "react"

export function FaviconFallback() {
  useEffect(() => {
    // Create a simple canvas-based favicon as fallback
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Clear background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 32, 32)

      // Draw simple sword shape
      ctx.fillStyle = "#000000"

      // Sword blade (vertical rectangle)
      ctx.fillRect(14, 4, 4, 20)

      // Sword guard (horizontal rectangle)
      ctx.fillRect(10, 20, 12, 3)

      // Sword handle
      ctx.fillRect(14, 23, 4, 6)

      // Sword pommel
      ctx.fillRect(13, 28, 6, 2)

      // Convert to data URL and set as favicon
      const dataURL = canvas.toDataURL("image/png")

      // Find existing favicon link or create new one
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement("link")
        link.rel = "icon"
        document.head.appendChild(link)
      }
      link.href = dataURL
    }
  }, [])

  return null
}
