// Blog post types (aligned with Supabase posts table)

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: 'Life' | 'Work' | 'Hobbies' | 'Experience'
  tags: string[]
  featuredImage?: string
  author: Author
  publishedAt: string
  updatedAt?: string
  readTime: number
  status: 'draft' | 'published'
}

export interface Author {
  name: string
  avatar?: string
  bio?: string
}

export interface NavItem {
  label: string
  href: string
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}
