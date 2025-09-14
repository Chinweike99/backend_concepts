import { ClientStory } from '@/types'

interface StoryCardProps {
  story: ClientStory
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {story.image_url && (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{story.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">By {story.author}</span>
          <span className="text-sm text-gray-500">
            {new Date(story.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  )
}