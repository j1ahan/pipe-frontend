import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Editor from '@monaco-editor/react'
import { registerImageDslLanguage } from '@/lib/monacoDslLanguage'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, Download, Play, X } from 'lucide-react'

export const Route = createFileRoute('/playground')({
  component: Playground,
})

function Playground() {
  const [dslCode, setDslCode] = useState<string>('// Start coding your DSL here...')
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setOriginalImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleClearImage = () => {
    setOriginalImagePreview(null)
    setUploadedFile(null)
    setProcessedImage(null)
  }

  const handleRun = async () => {
    if (!uploadedFile) {
      alert('Please upload an image first.')
      return
    }

    setIsLoading(true)
    setProcessedImage(null) // Clear previous result

    const formData = new FormData()
    formData.append('dsl_code', dslCode)
    formData.append('image', uploadedFile)

    try {
      const response = await fetch('http://localhost:8080/api/v1/playground', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Something went wrong.'}`)
        console.error('Backend error:', errorData)
      }
    } catch (error) {
      alert('Network error or backend is not running.')
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={50}>
        <div className="flex flex-col h-full gap-4 p-4">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle>DSL Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow relative">
              <div className="h-full w-full border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="imageDsl"
                  defaultValue={dslCode}
                  onChange={(value) => setDslCode(value || '')}
                  theme="vs"
                  onMount={(editor, monaco) => {
                    registerImageDslLanguage(monaco);
                  }}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={handleRun} disabled={isLoading || !uploadedFile}>
              {isLoading ? 'Running...' : <><Play className="mr-2 h-4 w-4" /> Run</>}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDslCode('// Start coding your DSL here...')} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Clear DSL
            </Button>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="h-full flex flex-col p-4 space-y-4">
          <div className="flex-1 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Original Image</CardTitle>
                {originalImagePreview ? (
                  <Button variant="outline" size="sm" onClick={handleClearImage}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Label htmlFor="image-upload">
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Label>
                  </Button>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center overflow-hidden p-2">
                {originalImagePreview ? (
                  <img src={originalImagePreview} alt="Original" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border rounded-md">
                    <p className="text-gray-500 text-center">Upload an image to start</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Processed Result</CardTitle>
                <Button size="sm" disabled={!processedImage}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center overflow-hidden p-2">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center border rounded-md">
                    <p className="text-gray-500 text-center">Processing...</p>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border rounded-md">
                    <p className="text-gray-500 text-center">Result will be shown here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
