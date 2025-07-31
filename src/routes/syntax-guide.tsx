import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { ReactNode } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Info, AlertCircle, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { registerImageDslLanguage } from '@/lib/monacoDslLanguage';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import basicsVariables from './syntax-guide-content/basics-variables.dsl?raw';
import basicsExpressions1 from './syntax-guide-content/basics-expressions-1.dsl?raw';
import basicsExpressions2 from './syntax-guide-content/basics-expressions-2.dsl?raw';
import basicsPipelines1 from './syntax-guide-content/basics-pipelines-1.dsl?raw';
import basicsPipelines2 from './syntax-guide-content/basics-pipelines-2.dsl?raw';
import basicsLambdas1 from './syntax-guide-content/basics-lambdas-1.dsl?raw';
import basicsLambdas2 from './syntax-guide-content/basics-lambdas-2.dsl?raw';
import pixelOpsPixelOp1 from './syntax-guide-content/pixel-ops-pixel-op-1.dsl?raw';
import pixelOpsPixelOp2 from './syntax-guide-content/pixel-ops-pixel-op-2.dsl?raw';
import pixelOpsStencilOp1 from './syntax-guide-content/pixel-ops-stencil-op-1.dsl?raw';
import pixelOpsFieldAccess1 from './syntax-guide-content/pixel-ops-field-access-1.dsl?raw';
import filtersBasicFilters1 from './syntax-guide-content/filters-basic-filters-1.dsl?raw';
import filtersEdgeDetection1 from './syntax-guide-content/filters-edge-detection-1.dsl?raw';
import filtersEdgeDetection2 from './syntax-guide-content/filters-edge-detection-2.dsl?raw';
import filtersBlurFilters1 from './syntax-guide-content/filters-blur-filters-1.dsl?raw';
import filtersBlurFilters2 from './syntax-guide-content/filters-blur-filters-2.dsl?raw';
import filtersAdvancedFilters1 from './syntax-guide-content/filters-advanced-filters-1.dsl?raw';
import filtersAdvancedFilters2 from './syntax-guide-content/filters-advanced-filters-2.dsl?raw';
import filtersAdvancedFilters3 from './syntax-guide-content/filters-advanced-filters-3.dsl?raw';
import operatorsArithmetic1 from './syntax-guide-content/operators-arithmetic-1.dsl?raw';
import operatorsPipelineOp1 from './syntax-guide-content/operators-pipeline-op-1.dsl?raw';
import operatorsPipelineOp2 from './syntax-guide-content/operators-pipeline-op-2.dsl?raw';
import referenceExamples1 from './syntax-guide-content/reference-examples-1.dsl?raw';
import referenceExamples2 from './syntax-guide-content/reference-examples-2.dsl?raw';
import referenceExamples3 from './syntax-guide-content/reference-examples-3.dsl?raw';

export const Route = createFileRoute('/syntax-guide')({
  component: SyntaxGuide,
});

type ContentItem = {
  title: string;
  description?: string | ReactNode;
  blocks: ContentBlock[];
};

type ContentBlock = {
  type: 'code' | 'alert' | 'table';
  title?: string;
  content: string | ReactNode;
  id?: string;
  language?: string;
  variant?: 'default' | 'destructive';
};

const contentData: Record<string, Record<string, ContentItem>> = {
  basics: {
    variables: {
      title: 'Variables',
      description: 'Variables in the Image DSL are declared using the assignment operator. All variables are immutable once assigned.',
      blocks: [
        { type: 'code', title: 'Basic Variable Declaration', content: basicsVariables, id: 'var-basic' },
        { type: 'alert', title: 'Note', content: 'Variables can store images, numbers, strings, or function results. The type is inferred from the assigned value.' },
      ],
    },
    expressions: {
        title: 'Expressions',
        description: 'The DSL supports various types of expressions including arithmetic operations, function calls, and field access.',
        blocks: [
            { type: 'code', title: 'Arithmetic Expressions', content: basicsExpressions1, id: 'expr-arithmetic' },
            { type: 'code', title: 'Function Calls', content: basicsExpressions2, id: 'expr-functions' },
        ],
    },
    pipelines: {
        title: 'Pipelines',
        description: 'The pipeline operator (|) allows you to chain operations together, passing the output of one operation as input to the next.',
        blocks: [
            { type: 'code', title: 'Basic Pipeline', content: basicsPipelines1, id: 'pipeline-basic' },
            { type: 'code', title: 'Complex Pipelines', content: basicsPipelines2, id: 'pipeline-complex' },
            { type: 'alert', title: 'Pipeline Flow', content: 'Each operation in the pipeline receives the output of the previous operation as its input. The pipeline flows from left to right.' },
        ],
    },
    lambdas: {
        title: 'Lambda Functions',
        description: 'Lambda functions are anonymous functions used primarily with pixel_op and stencil_op for custom pixel transformations.',
        blocks: [
            { type: 'code', title: 'Lambda Syntax', content: basicsLambdas1, id: 'lambda-syntax' },
            { type: 'code', title: 'Practical Examples', content: basicsLambdas2, id: 'lambda-examples' },
        ],
    },
  },
  'pixel-ops': {
    'pixel-op': {
        title: 'pixel_op',
        description: 'The pixel_op function applies a transformation to each pixel individually using a lambda function.',
        blocks: [
            { type: 'code', title: 'Basic Usage', content: pixelOpsPixelOp1, id: 'pixelop-basic' },
            { type: 'code', title: 'Channel Operations', content: pixelOpsPixelOp2, id: 'pixelop-channels' },
        ],
    },
    'stencil-op': {
        title: 'stencil_op',
        description: 'The stencil_op function applies operations using a neighborhood of pixels, useful for convolution-like operations.',
        blocks: [
            { type: 'code', title: 'Basic Stencil Operations', content: pixelOpsStencilOp1, id: 'stencilop-basic' },
            { type: 'alert', variant: 'destructive', title: 'Performance Note', content: 'Larger stencil sizes (5x5, 7x7) will significantly impact performance. Use built-in filters when possible.' },
        ],
    },
    'field-access': {
        title: 'Field Access',
        description: 'Access individual color channels of a pixel using dot notation.',
        blocks: [
            { type: 'code', title: 'Field Access', content: pixelOpsFieldAccess1, id: 'field-basic' },
        ],
    },
  },
  filters: {
    'basic-filters': {
        title: 'Basic Filters',
        description: 'Built-in filters for common image processing operations.',
        blocks: [
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Filter</TableHead><TableHead>Parameters</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>grayscale</code></TableCell><TableCell>None</TableCell><TableCell>Convert to grayscale</TableCell></TableRow>
                        <TableRow><TableCell><code>brightness</code></TableCell><TableCell>float</TableCell><TableCell>Adjust brightness (-1.0 to 1.0)</TableCell></TableRow>
                        <TableRow><TableCell><code>contrast</code></TableCell><TableCell>float</TableCell><TableCell>Adjust contrast (0.0 to 2.0+)</TableCell></TableRow>
                        <TableRow><TableCell><code>threshold</code></TableCell><TableCell>float</TableCell><TableCell>Binary threshold (0.0 to 1.0)</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
            { type: 'code', title: 'Basic Filter Usage', content: filtersBasicFilters1, id: 'basic-filters-example' },
        ],
    },
    'edge-detection': {
        title: 'Edge Detection',
        description: 'Comprehensive edge detection operations including Sobel and Canny edge detectors.',
        blocks: [
            { type: 'code', title: 'Sobel Operators', content: filtersEdgeDetection1, id: 'sobel-ops' },
            { type: 'code', title: 'Canny Edge Detection', content: filtersEdgeDetection2, id: 'canny-detection' },
            { type: 'alert', title: 'Edge Detection Tips', content: (
                <ul className="list-disc list-inside mt-2">
                    <li>Apply Gaussian blur before edge detection to reduce noise</li>
                    <li>Lower thresholds detect more edges but include more noise</li>
                    <li>Canny edge detection provides the cleanest edges</li>
                </ul>
            )},
        ],
    },
    'blur-filters': {
        title: 'Blur Filters',
        description: 'Various blur operations for smoothing and noise reduction.',
        blocks: [
            { type: 'code', title: 'Gaussian Blur', content: filtersBlurFilters1, id: 'gaussian-blur' },
            { type: 'code', title: 'Bilateral Filter', content: filtersBlurFilters2, id: 'bilateral-filter' },
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Filter</TableHead><TableHead>Use Case</TableHead><TableHead>Edge Preservation</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Gaussian Blur</TableCell><TableCell>General smoothing, pre-processing</TableCell><TableCell>Low</TableCell></TableRow>
                        <TableRow><TableCell>Bilateral Filter</TableCell><TableCell>Noise reduction, skin smoothing</TableCell><TableCell>High</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
        ],
    },
    'advanced-filters': {
        title: 'Advanced Filters',
        description: 'Specialized filters for advanced image processing tasks.',
        blocks: [
            { type: 'code', title: 'Non-Maximum Suppression', content: filtersAdvancedFilters1, id: 'non-max' },
            { type: 'code', title: 'Double Threshold', content: filtersAdvancedFilters2, id: 'double-threshold' },
            { type: 'code', title: 'Hysteresis Tracking', content: filtersAdvancedFilters3, id: 'hysteresis' },
        ],
    },
  },
  operators: {
    arithmetic: {
        title: 'Arithmetic Operators',
        description: 'Standard arithmetic operators for numeric expressions.',
        blocks: [
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Operator</TableHead><TableHead>Description</TableHead><TableHead>Example</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>+</code></TableCell><TableCell>Addition</TableCell><TableCell><code>a + b</code></TableCell></TableRow>
                        <TableRow><TableCell><code>-</code></TableCell><TableCell>Subtraction</TableCell><TableCell><code>a - b</code></TableCell></TableRow>
                        <TableRow><TableCell><code>*</code></TableCell><TableCell>Multiplication</TableCell><TableCell><code>a * b</code></TableCell></TableRow>
                        <TableRow><TableCell><code>/</code></TableCell><TableCell>Division</TableCell><TableCell><code>a / b</code></TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
            { type: 'code', title: 'Arithmetic Examples', content: operatorsArithmetic1, id: 'arithmetic-examples' },
        ],
    },
    'pipeline-op': {
        title: 'Pipeline Operator',
        description: 'The pipeline operator (|) is the primary way to compose operations in the Image DSL.',
        blocks: [
            { type: 'code', title: 'Pipeline Basics', content: operatorsPipelineOp1, id: 'pipeline-basics' },
            { type: 'code', title: 'Complex Pipelines', content: operatorsPipelineOp2, id: 'pipeline-advanced' },
        ],
    },
  },
  reference: {
    'all-operations': {
        title: 'All Operations Reference',
        description: 'Complete reference of all available operations in the Image DSL.',
        blocks: [
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Operation</TableHead><TableHead>Syntax</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>grayscale</code></TableCell><TableCell><code>img | grayscale</code></TableCell><TableCell>Convert to grayscale</TableCell></TableRow>
                        <TableRow><TableCell><code>brightness</code></TableCell><TableCell><code>img | brightness(0.3)</code></TableCell><TableCell>Adjust brightness</TableCell></TableRow>
                        <TableRow><TableCell><code>contrast</code></TableCell><TableCell><code>img | contrast(1.5)</code></TableCell><TableCell>Adjust contrast</TableCell></TableRow>
                        <TableRow><TableCell><code>threshold</code></TableCell><TableCell><code>img | threshold(0.5)</code></TableCell><TableCell>Binary threshold</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Operation</TableHead><TableHead>Syntax</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>sobel</code></TableCell><TableCell><code>img | sobel</code></TableCell><TableCell>Sobel edge detection</TableCell></TableRow>
                        <TableRow><TableCell><code>sobel_x</code></TableCell><TableCell><code>img | sobel_x</code></TableCell><TableCell>Horizontal edges</TableCell></TableRow>
                        <TableRow><TableCell><code>sobel_y</code></TableCell><TableCell><code>img | sobel_y</code></TableCell><TableCell>Vertical edges</TableCell></TableRow>
                        <TableRow><TableCell><code>canny_edge</code></TableCell><TableCell><code>img | canny_edge(0.1, 0.3)</code></TableCell><TableCell>Canny edge detection</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Operation</TableHead><TableHead>Syntax</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>gaussian_blur</code></TableCell><TableCell><code>img | gaussian_blur(5)</code></TableCell><TableCell>Gaussian blur with kernel size</TableCell></TableRow>
                        <TableRow><TableCell><code>bilateral_filter</code></TableCell><TableCell><code>img | bilateral_filter(5.0, 10.0)</code></TableCell><TableCell>Edge-preserving blur</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
            { type: 'table', content: (
                <Table>
                    <TableHeader><TableRow><TableHead>Operation</TableHead><TableHead>Syntax</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell><code>pixel_op</code></TableCell><TableCell><code>img | pixel_op((p) {'=>'.toString()} expr)</code></TableCell><TableCell>Per-pixel transformation</TableCell></TableRow>
                        <TableRow><TableCell><code>stencil_op</code></TableCell><TableCell><code>img | stencil_op(size, (c, n) {'=>'.toString()} expr)</code></TableCell><TableCell>Neighborhood operation</TableCell></TableRow>
                    </TableBody>
                </Table>
            )},
        ],
    },
    examples: {
        title: 'Complete Examples',
        description: 'Full examples demonstrating common image processing tasks.',
        blocks: [
            { type: 'code', title: 'Edge Detection Workflow', content: referenceExamples1, id: 'example-edge' },
            { type: 'code', title: 'Image Enhancement', content: referenceExamples2, id: 'example-enhance' },
            { type: 'code', title: 'Custom Filters', content: referenceExamples3, id: 'example-custom' },
        ],
    },
  },
};

const sections: { id: string; title: string; items: { id: string; title: string }[] }[] = Object.entries(contentData).map(([sectionId, sectionContent]) => ({
    id: sectionId,
    title: sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    items: Object.entries(sectionContent).map(([itemId, itemContent]) => ({
        id: itemId,
        title: itemContent.title,
    })),
}));

function SyntaxGuide() {
  const [activeSection, setActiveSection] = useState('basics');
  const [activeItem, setActiveItem] = useState('variables');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'imageDsl', id }: { code: string; language?: string; id: string }) => (
    <div className="relative group w-full h-64 border rounded-md">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs"
        onMount={(_, monaco) => {
          registerImageDslLanguage(monaco);
        }}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        <Copy className="h-4 w-4" />
        {copiedCode === id && <span className="ml-2 text-xs">Copied!</span>}
      </Button>
    </div>
  );

  const renderContent = () => {
    const content = contentData[activeSection]?.[activeItem];

    if (!content) {
      return <div>Select an item from the sidebar</div>;
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">{content.title}</h2>
          {content.description && <p className="text-muted-foreground mb-4">{content.description}</p>}
          <div className="space-y-4">
            {content.blocks.map((block, index) => {
              const key = `${activeSection}-${activeItem}-${index}`;
              if (block.type === 'code') {
                return (
                  <div key={key}>
                    {block.title && <h3 className="text-lg font-medium mb-2">{block.title}</h3>}
                    <CodeBlock id={block.id || key} code={block.content as string} language={block.language} />
                  </div>
                );
              }
              if (block.type === 'alert') {
                return (
                  <Alert key={key} variant={block.variant}>
                    {block.variant === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                    <AlertTitle>{block.title}</AlertTitle>
                    <AlertDescription>{block.content}</AlertDescription>
                  </Alert>
                );
              }
              if (block.type === 'table') {
                return <div key={key}>{block.content}</div>;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/10 p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-6">Image DSL Syntax Guide</h1>
        <nav className="space-y-4">
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items?.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(section.id);
                        setActiveItem(item.id);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                        'hover:bg-muted',
                        activeSection === section.id && activeItem === item.id
                          ? 'bg-muted font-medium'
                          : ''
                      )}
                    >
                      <span className="flex items-center">
                        {activeSection === section.id && activeItem === item.id && (
                          <ChevronRight className="h-4 w-4 mr-1" />
                        )}
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
}
