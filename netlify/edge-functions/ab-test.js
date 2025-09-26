export default async (request, context) => {
  const url = new URL(request.url)
  
  // Only run A/B test on homepage
  if (url.pathname !== '/') {
    return await context.next()
  }
  
  // Get or set A/B test variant
  let variant = context.cookies.get('ab-variant')
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B'
    context.cookies.set('ab-variant', variant, {
      maxAge: 86400 * 30, // 30 days
      httpOnly: false
    })
  }
  
  const response = await context.next()
  
  // Inject variant info into HTML
  if (response.headers.get('content-type')?.includes('text/html')) {
    const html = await response.text()
    const modifiedHtml = html.replace(
      '<body',
      `<body data-variant="${variant}"`
    )
    
    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers
    })
  }
  
  return response
}

export const config = {
  path: '/'
}