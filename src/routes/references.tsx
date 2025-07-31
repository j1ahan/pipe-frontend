import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/references')({
  component: References,
})

interface Reference {
  name: string
  url: string
  tags: string[]
}

function References() {
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetch('/references-data.json')
        const data = await response.json()
        setReferences(data.references)
      } catch (error) {
        console.error('Failed to load references:', error)
      } finally {
        setLoading(false)
      }
    }
    loadReferences()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading references...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          References & Acknowledgements
        </h1>
        <p className="text-base text-slate-600">
          This project builds upon the work of many excellent tools, libraries, and research papers in the field of compiler design and image processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {references.map((ref, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{ref.name}</h3>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 break-all"
                >
                  {ref.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {ref.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}