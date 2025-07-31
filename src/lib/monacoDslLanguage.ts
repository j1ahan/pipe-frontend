export function registerImageDslLanguage(monaco: any) {
  // 1. Register language
  monaco.languages.register({ id: 'imageDsl' });

  // 2. Define Monarch tokenizer rules
  monaco.languages.setMonarchTokensProvider('imageDsl', {
    // Keywords (built-in operations and concepts extracted from AST)
    keywords: [
      'grayscale', 'sobel', 'sobel_x', 'sobel_y', 'gradient_magnitude', 
      'gradient_direction', 'non_max_suppression', 'double_threshold', 
      'hysteresis_tracking', 'gaussian_blur', 'brightness', 'contrast', 
      'threshold', 'bilateral_filter', 'canny_edge',
      'pixel_op', 'stencil_op',
      'true', 'false', 'null'
    ],

    // Operators (arithmetic, pipeline, assignment, lambda, member access from AST)
    operators: [
      '+', '-', '*', '/', '|', '=', '=>', '.'
    ],

    // Built-in functions or types (FuncCall names from AST and FieldAccess fields)
    builtinFunctions: [
      'width', 'height', 'path', 'value', 'pixel', 'rgb', 'rgba',
      'r', 'g', 'b' // For FieldAccess, e.g., p.r
    ],

    // Common regular expressions
    symbols: /[+\-*\/|=.>]+/, // Match operators
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/g,
    digits: /\d+(_+\d*)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    hexdigits: /[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,

    // Tokenizer rules
    tokenizer: {
      root: [
        // Identifiers and keywords
        [/[a-zA-Z_][a-zA-Z0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtinFunctions': 'predefined',
            '@default': 'identifier'
          }
        }],

        // Numbers (floating point)
        [/(@digits)[eE]([-+]?(@digits))?/, 'number.float'],
        [/(@digits)\.(@digits)([eE]([-+]?(@digits))?)?/, 'number.float'],
        [/(@digits)/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // Incomplete string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

        // Comments
        [/\/\/.*$/, 'comment'], // Single-line comment
        [/\/\*/, { token: 'comment.quote', bracket: '@open', next: '@comment' }], // Block comment

        // Operators
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // Punctuation
        [/[{}()\[\]]/, '@brackets'],
        [/[;,]/, 'delimiter'], // Commas and semicolons
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],

      comment: [
        [/[^/*]+/, 'comment'],
        [/\/\*/, { token: 'comment.quote', bracket: '@open', next: '@push' }],
        [/\*\//, { token: 'comment.quote', bracket: '@close', next: '@pop' }],
        [/[/*]/, 'comment']
      ],
    },
  });

  // 3. Register language configuration (optional but recommended)
  monaco.languages.setLanguageConfiguration('imageDsl', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });
}