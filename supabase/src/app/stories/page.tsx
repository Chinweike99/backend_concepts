import StoryCard from '@/components/StoryCard'
import { ClientStory } from '@/types'

async function getStories(): Promise<ClientStory[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stories`, {
    cache: 'no-store',
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch stories')
  }
  
  return res.json()
}

export default async function StoriesPage() {
  const stories = await getStories()

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Client Success Stories</h1>
        
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No stories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}