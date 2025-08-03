import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Code } from "lucide-react";
import Editor from "@monaco-editor/react";
import { registerImageDslLanguage } from "@/lib/monacoDslLanguage";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [dslCode, setDslCode] = useState<string>("// Loading...");
  const [halideCode, setHalideCode] = useState<string>("// Loading...");
  useEffect(() => {
    const loadCodes = async () => {
      try {
        // Load DSL code
        const dslResponse = await fetch("/examples/canny/canny.dsl");
        const dslText = dslResponse.ok
          ? await dslResponse.text()
          : "// Error loading DSL code.";
        setDslCode(dslText);

        // Load Halide code
        const halideResponse = await fetch("/examples/canny/canny_halide.cpp");
        const halideText = halideResponse.ok
          ? await halideResponse.text()
          : "// Error loading Halide code.";
        setHalideCode(halideText);
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
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          <span className="text-blue-600">PIPE</span>
          <span className="text-black">
            : Pipelined Image Processing Expression
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          PIPE is a novel external DSL that provides intuitive, pipe-based declarative
          composition syntax.<br/> With MLIR-based auto polyhedral optimization, PIPE matches or
          exceeds Halide's performance across multiple algorithms on both modern x86 and Apple silicon platforms.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-48">
            <Link to="/benchmark">
              View Benchmarks <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-48">
            <Link to="/syntax-guide">
              Learn Syntax <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Code Comparison Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Canny Edge Detection: Halide vs PIPE
        </h2>

        {/* Performance Stats */}
        <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">36x</div>
              <div className="text-sm text-muted-foreground">Less Code</div>
              <div className="text-xs text-muted-foreground">7 vs 250+ lines</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">2.19x</div>
              <div className="text-sm text-muted-foreground">
                Faster Execution
              </div>
              <div className="text-xs text-muted-foreground">
                Performance speedup
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-muted-foreground">Declarative</div>
              <div className="text-xs text-muted-foreground">
                Pure pipeline syntax
              </div>
            </div>
          </div>
        </div>

        {/* Code Comparison */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Halide Code */}
          <Card className="h-[500px]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Halide C++</h3>
                <span className="text-sm text-muted-foreground ml-auto">
                  ~250+ lines
                </span>
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

          {/* PIPE DSL Code */}
          <Card className="h-[500px]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">PIPE DSL</h3>
                <span className="text-sm text-muted-foreground ml-auto">
                  7 lines
                </span>
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
                  onMount={(_, monaco) => {
                    registerImageDslLanguage(monaco);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
