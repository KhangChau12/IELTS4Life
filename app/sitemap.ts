import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ielts4life.com'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: prompts } = await supabase
    .from('writing_prompts')
    .select('id, updated_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const promptUrls: MetadataRoute.Sitemap = (prompts || []).map((p) => ({
    url: `${baseUrl}/write/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/write`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/score`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/subscription`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    ...promptUrls,
  ]
}
