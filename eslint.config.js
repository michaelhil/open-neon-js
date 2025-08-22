export default [
  {
    files: ['packages/*/src/**/*.js', 'test-utils/**/*.js', 'scripts/**/*.js', 'examples/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        WebSocket: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        EventTarget: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    },
    rules: {
      // Error Prevention
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-duplicate-case': 'error',
      
      // Code Quality
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['warn', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      
      // Style Consistency
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'keyword-spacing': 'error',
      'space-before-blocks': 'error',
      'space-infix-ops': 'error',
      
      // ES6+ Features
      'arrow-spacing': 'error',
      'template-curly-spacing': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-useless-constructor': 'error',
      
      // Import/Export
      'no-duplicate-imports': 'error'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly'
      }
    },
    rules: {
      // Relax some rules for test files
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }]
    }
  },
  {
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    }
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
      '.bun/',
      'coverage/',
      'test-results/'
    ]
  }
]