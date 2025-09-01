import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export const OptimizedImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)

  // Simple className merging without cn utility
  const containerClass = `relative overflow-hidden ${className || ''}`
  
  const imageClass = `duration-700 ease-in-out ${
    isLoading 
      ? 'scale-110 blur-2xl grayscale' 
      : 'scale-100 blur-0 grayscale-0'
  }`

  return (
    <div className={containerClass}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        className={imageClass}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

export default OptimizedImage
