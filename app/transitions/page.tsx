import TransitionGallery from '@/components/transitions/TransitionGallery'

export const metadata = {
  title: 'Transition Gallery | Forza Color Universe',
  description: 'Browse and vote on 10 unique page transition animations. Help decide the winner!',
}

export default function TransitionsPage() {
  return (
    <main className="min-h-screen bg-gray-950 py-8">
      <TransitionGallery />
    </main>
  )
}
