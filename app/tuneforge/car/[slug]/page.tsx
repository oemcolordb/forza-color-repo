

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TuneCalcClient from './client'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  
  return {
    title: `Tune ${decoded} | Forza Color Universe`,
    description: `Tuning calculator for ${decoded} - Create optimized tunes with AI-powered advice`,
  }
}

async function getCarBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tuneforge/cars`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const cars = await res.json()
    const decoded = decodeURIComponent(slug)
    return cars.find((car: any) => 
      `${car.manufacturer} ${car.model}`.toLowerCase() === decoded.toLowerCase()
    )
  } catch {
    return null
  }
}

export default async function CarTunePage({ params }: PageProps) {
  const { slug } = await params
  const car = await getCarBySlug(slug)
  
  if (!car) {
    notFound()
  }
  
  return <TuneCalcClient car={car} />
}
