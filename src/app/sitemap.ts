import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://trip-c.in' // Update with your production URL
  
  // List of static routes based on actual app directory structure
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/contact',
    '/payment',
    '/select-car',
  ]

  // List of major cities you serve (add more as needed)
  const cities = [
    'bangalore',
    'mumbai',
    'delhi',
    'hyderabad',
    'chennai',
    'pune',
    'kolkata',
    'ahmedabad',
    'jaipur',
    'kochi',
    'goa',
    'mysore',
    'coorg',
    'ooty',
    'munnar',
  ]

  // Generate city-specific routes
  const cityRoutes = cities.flatMap(city => ({
    url: `/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Static routes with metadata
  const staticSitemap = staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8, // Homepage has highest priority
  }))

  // Combine all routes
  return [
    ...staticSitemap,
    ...cityRoutes.map(route => ({
      ...route,
      url: `${baseUrl}${route.url}`,
    })),
  ]
}
