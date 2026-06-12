import { NextRequest, NextResponse } from 'next/server'
import { Jimp } from 'jimp'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('u')
  const themeColor = searchParams.get('t') || '#24744C'
  const initials = (searchParams.get('n') || 'VC').substring(0, 3)

  // Cache headers for immutable long-term caching
  const headers = {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=31536000, immutable',
  }

  // Fallback SVG generator
  const getInitialsSvg = () => {
    const cleanColor = themeColor.startsWith('#') ? themeColor : `#${themeColor}`
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="16" fill="${cleanColor}" />
      <text x="16" y="17" fill="white" font-size="13" font-weight="bold" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>`
  }

  if (!imageUrl) {
    return new NextResponse(getInitialsSvg(), { status: 200, headers })
  }

  try {
    // Implement fetch with timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(imageUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Load into Jimp, resize to 64x64 for efficiency
    const image = await Jimp.read(buffer)
    image.cover({ w: 64, h: 64 })
    
    // Export to PNG for high quality transparency if needed
    const optimizedBuffer = await image.getBuffer('image/png')
    const base64Data = optimizedBuffer.toString('base64')

    const cleanColor = themeColor.startsWith('#') ? themeColor : `#${themeColor}`
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <defs>
        <clipPath id="circleView">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="16" fill="${cleanColor}" />
      <image href="data:image/png;base64,${base64Data}" x="0" y="0" width="32" height="32" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice" />
    </svg>`

    return new NextResponse(svgContent, { status: 200, headers })
  } catch (error) {
    console.error('Error rendering dynamic favicon:', error)
    // Return initials fallback SVG on failure but allow it to be requested again without hard caching
    return new NextResponse(getInitialsSvg(), {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}
