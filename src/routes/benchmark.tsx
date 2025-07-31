
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Editor from '@monaco-editor/react';
import { registerImageDslLanguage } from '@/lib/monacoDslLanguage';

export const Route = createFileRoute('/benchmark')({
  component: Benchmark,
});

function Benchmark() {
  const [selectedOperator, setSelectedOperator] = useState('canny');
  const [dslCode, setDslCode] = useState<string>('');
  const [halideCode, setHalideCode] = useState<string>('');
  const [dslTime, setDslTime] = useState<string>('-- ms');
  const [halideTime, setHalideTime] = useState<string>('-- ms');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadBenchmarkData = async () => {
      try {
        // Load DSL code
        const dslResponse = await fetch(`/examples/${selectedOperator}/${selectedOperator}.dsl`);
        const dslText = dslResponse.ok ? await dslResponse.text() : '// Error loading DSL code.';
        setDslCode(dslText);

        // Load Halide code
        const halideResponse = await fetch(`/examples/${selectedOperator}/${selectedOperator}_halide.cpp`);
        const halideText = halideResponse.ok ? await halideResponse.text() : '// Error loading Halide code.';
        setHalideCode(halideText);

        // Load timing data
        const resultResponse = await fetch(`/examples/${selectedOperator}/result.json`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          setDslTime(resultData.dsl + ' ms');
          setHalideTime(resultData.halide + ' ms');
        } else {
          setDslTime('-- ms');
          setHalideTime('-- ms');
        }

        // Set image paths
        setOriginalImage(`/examples/${selectedOperator}/original.png`);
        setProcessedImage(`/examples/${selectedOperator}/processed.png`);
      } catch (error) {
        console.error("Failed to load benchmark data:", error);
        setDslCode('// Error loading DSL code.');
        setHalideCode('// Error loading Halide code.');
        setDslTime('-- ms');
        setHalideTime('-- ms');
        setOriginalImage(null);
        setProcessedImage(null);
      }
    };

    loadBenchmarkData();
  }, [selectedOperator]);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Row 1: Algorithm selector and time comparison */}
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select onValueChange={setSelectedOperator} defaultValue={selectedOperator}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select an operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canny">Canny Edge Detection</SelectItem>
                <SelectItem value="blur">Gaussian Blur</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <Label>PIPE Execution Time</Label>
              <p className="text-2xl font-bold">{dslTime}</p>
            </div>
            <div className="text-right">
              <Label>Halide Execution Time</Label>
              <p className="text-2xl font-bold">{halideTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: DSL and Halide code display */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 h-[500px]">
            <div className="flex flex-col">
              <CardTitle className="mb-4">PIPE Version</CardTitle>
              <div className="flex-grow border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language="imageDsl"
                  value={dslCode}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                  onMount={(_, monaco) => {
                    registerImageDslLanguage(monaco);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <CardTitle className="mb-4">Halide Version</CardTitle>
              <div className="flex-grow border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language="cpp"
                  value={halideCode}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Original image at 80% scale */}
      <Card>
        <CardHeader>
          <CardTitle>Original Image</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full flex items-center justify-center overflow-hidden border rounded-md min-h-[400px]">
            {originalImage ? (
              <img 
                src={originalImage} 
                alt="Original" 
                className="max-w-full max-h-full object-contain"
                style={{ transform: 'scale(0.8)' }}
              />
            ) : (
              <p className="text-gray-500 text-center">Image not available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Processed result at 80% scale */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Result</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full flex items-center justify-center overflow-hidden border rounded-md min-h-[400px]">
            {processedImage ? (
              <img 
                src={processedImage} 
                alt="Processed" 
                className="max-w-full max-h-full object-contain"
                style={{ transform: 'scale(0.8)' }}
              />
            ) : (
              <p className="text-gray-500 text-center">Result not available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

