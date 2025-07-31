import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ArrowBigRight, Zap, Code } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { registerImageDslLanguage } from '@/lib/monacoDslLanguage'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [dslCode, setDslCode] = useState<string>('// Loading...');
  const [halideCode, setHalideCode] = useState<string>('// Loading...');
  const [dslTime, setDslTime] = useState<string>('--');
  const [halideTime, setHalideTime] = useState<string>('--');

  useEffect(() => {
    const loadCodes = async () => {
      try {
        // Load DSL code
        const dslResponse = await fetch('/examples/canny/canny.dsl');
        const dslText = dslResponse.ok ? await dslResponse.text() : '// Error loading DSL code.';
        setDslCode(dslText);

        // Load Halide code
        const halideResponse = await fetch('/examples/canny/canny_halide.cpp');
        const halideText = halideResponse.ok ? await halideResponse.text() : '// Error loading Halide code.';
        setHalideCode(halideText);

        // Load timing data
        const resultResponse = await fetch('/examples/canny/result.json');
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          setDslTime(resultData.dsl);
          setHalideTime(resultData.halide);
        }
      } catch (error) {
        console.error("Failed to load code data:", error);
      }
    };

    loadCodes();
  }, []);
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
          PIPE
        </h1>
        <p className="text-xl lg:text-2xl font-medium text-muted-foreground">
          Pipelined Image Processing Expression
        </p>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          A novel external DSL that provides intuitive, pipe-based declarative composition syntax. 
          With modern compilation tools, it matches or exceeds Halide's performance across multiple algorithms.
        </p>
      </div>

      {/* Code Comparison */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Canny Edge Detection: PIPE vs Halide</h2>
        
        <div className="grid lg:grid-cols-[1fr_80px_1fr] gap-6 items-center">
          {/* Halide Code */}
          <Card className="h-[500px]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Halide C++</h3>
                <span className="text-sm text-muted-foreground ml-auto">~250+ lines</span>
              </div>
              <div className="flex-1 border rounded-md">
                <Editor
                  height="100%"
                  language="cpp"
                  value={halideCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
              <ArrowBigRight className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* PIPE DSL Code */}
          <Card className="h-[500px]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">PIPE DSL</h3>
                <span className="text-sm text-muted-foreground ml-auto">7 lines</span>
              </div>
              <div className="flex-1 border rounded-md">
                <Editor
                  height="100%"
                  language="imageDsl"
                  value={dslCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                  }}
                  onMount={(editor, monaco) => {
                    registerImageDslLanguage(monaco);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">36x</div>
            <div className="text-sm text-muted-foreground">Less Code</div>
            <div className="text-xs text-muted-foreground">7 vs 250+ lines</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">2.25x</div>
            <div className="text-sm text-muted-foreground">Faster Execution</div>
            <div className="text-xs text-muted-foreground">Performance speedup</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-muted-foreground">Declarative</div>
            <div className="text-xs text-muted-foreground">Pure pipeline syntax</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-semibold">Explore PIPE DSL</h3>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/benchmark">
              View Benchmarks <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/syntax-guide">
              Learn Syntax <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
