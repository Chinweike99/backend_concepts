export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_name: string
  customer_email: string
  product_id: string
  booking_date: string
  status: string
  notes: string
  zoom_meeting_id: string | null
  created_at: string
  products?: Product
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image_url: string
  social_links: Record<string, string>
  created_at: string
}

export interface ClientStory {
  id: string
  title: string
  content: string
  author: string
  image_url: string
  is_published: boolean
  created_at: string
}