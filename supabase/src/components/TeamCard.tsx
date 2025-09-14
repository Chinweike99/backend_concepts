import { TeamMember } from '@/types'

interface TeamCardProps {
  member: TeamMember
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden text-center">
      <img
        src={member.image_url || '/placeholder-avatar.jpg'}
        alt={member.name}
        className="w-32 h-32 rounded-full mx-auto mt-6 object-cover"
      />
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
        <p className="text-primary mb-3">{member.role}</p>
        <p className="text-gray-600 text-sm">{member.bio}</p>
        
        {member.social_links && (
          <div className="flex justify-center space-x-4 mt-4">
            {Object.entries(member.social_links).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}