import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/references')({
  component: References,
})

function References() {
  return (
    <div className="p-2">
      <h3 className="text-lg font-bold mb-4">References</h3>
      <p>This page lists the third-party libraries and tools used in the backend compilation system.</p>
      {/* Add your references here */}
    </div>
  )
}
