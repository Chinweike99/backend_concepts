import TeamCard from '@/components/TeamCard'
import { TeamMember } from '@/index'

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/teams`, {
    cache: 'no-store',
  })
  
  if (!res.ok) {
    throw Error('Failed to fetch team members')
  }
  
  return res.json()
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Story */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-center mb-8">Our Story</h1>
          <div className="prose prose-lg max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded with a vision to revolutionize the industry, our company has been at the 
              forefront of innovation and excellence. We believe in creating meaningful solutions 
              that make a real difference in our clients' lives.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our journey began over a decade ago, and since then, we've helped countless 
              businesses achieve their goals through our tailored services and products. 
              We're committed to maintaining the highest standards of quality and customer satisfaction.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}