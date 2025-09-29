#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { flattenObject } = require('./helpers.cjs');

// Function to recursively find all files matching extensions
function findFiles(dir, extensions, ignoreDirs = ['node_modules', 'dist', 'build']) {
  const files = [];

  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }

  walk(dir);
  return files;
}

// Function to extract t() calls from source files
function extractTranslationKeys(srcDir) {
  const keys = new Set();
  const dynamicKeys = new Set();

  // Patterns to match t() calls
  const patterns = [
    /\bt\(['"`]([^'"`]+)['"`]\)/g,                    // t('key')
    /\bt\(['"`]([^'"`]+)['"`],\s*{/g,                 // t('key', { interpolation })
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,             // t( 'key' )
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*,/g,              // t( 'key', ...)
  ];

  // Pattern for dynamic keys like t(`employee.${status}`)
  const dynamicPattern = /\bt\(`([^`]+)\$\{[^}]+\}([^`]*)`/g;

  // Find all TypeScript and TSX files
  const files = findFiles(srcDir, ['.ts', '.tsx']);

  console.log(`Found ${files.length} source files to analyze...`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Extract static keys
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1];
        // Filter out obvious non-translation keys
        if (isValidTranslationKey(key)) {
          keys.add(key);
        }
      }
      // Reset regex state for next file
      pattern.lastIndex = 0;
    });

    // Extract dynamic keys (template literals)
    let dynamicMatch;
    while ((dynamicMatch = dynamicPattern.exec(content)) !== null) {
      const prefix = dynamicMatch[1];
      const suffix = dynamicMatch[2] || '';
      dynamicKeys.add(`${prefix}*${suffix}`);
    }
    dynamicPattern.lastIndex = 0;
  });

  return { staticKeys: keys, dynamicKeys };
}

// Function to validate if a string is likely a translation key
function isValidTranslationKey(key) {
  // Filter out common false positives
  const invalidPatterns = [
    /^\//, // URLs starting with /
    /^@\//, // Module imports
    /^https?:\/\//, // HTTP URLs
    /^[A-Z_]+$/, // All caps (likely constants)
    /^[a-z]$/, // Single lowercase letters
    /^[-_]$/, // Single special chars
    /^[0-9]+[a-z]*$/, // Numbers with optional suffix
    /\.(tsx?|jsx?|css|json)$/, // File extensions
    /^(content-type|authorization|x-)/i, // HTTP headers
  ];

  // Must contain at least one dot (nested key) or be a known top-level key
  const topLevelKeys = ['common', 'auth', 'employee', 'admin', 'staff', 'store', 'validation', 'profile', 'permission', 'errors', 'notifications', 'pwa', 'pcOnly', 'orientation'];
  const keyParts = key.split('.');

  // Check if it's a valid pattern
  if (invalidPatterns.some(pattern => pattern.test(key))) {
    return false;
  }

  // Valid if it's a known top-level key or has dot notation
  return topLevelKeys.includes(keyParts[0]) || key.includes('.');
}

// Function to load safe keys configuration
function loadSafeKeys() {
  const safeKeysPath = path.join(__dirname, 'i18n-safe-keys.json');
  try {
    if (fs.existsSync(safeKeysPath)) {
      const config = JSON.parse(fs.readFileSync(safeKeysPath, 'utf8'));
      return {
        keys: config.safeKeys || [],
        patterns: config.patterns || []
      };
    }
  } catch (err) {
    console.warn('⚠️  Failed to load safe keys configuration:', err.message);
  }
  return { keys: [], patterns: [] };
}

// Function to check if a key is safe (should not be marked as unused)
function isSafeKey(key, safeConfig) {
  // Check exact matches
  if (safeConfig.keys.includes(key)) {
    return true;
  }

  // Check patterns
  for (const pattern of safeConfig.patterns) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    if (regex.test(key)) {
      return true;
    }
  }

  return false;
}

// Main analysis function
function analyzeI18n() {
  console.log('🔍 Analyzing i18n translations...\n');

  // Load safe keys configuration
  const safeConfig = loadSafeKeys();
  if (safeConfig.keys.length > 0 || safeConfig.patterns.length > 0) {
    console.log(`🛡️  Loaded ${safeConfig.keys.length} safe keys and ${safeConfig.patterns.length} patterns\n`);
  }

  // 1. Load and flatten en.json
  const enJsonPath = path.join(__dirname, '../../src/locales/en.json');
  const enTranslations = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
  const flattenedTranslations = flattenObject(enTranslations);

  console.log(`📄 Flattened en.json: ${Object.keys(flattenedTranslations).length} keys`);

  // 2. Extract t() usage from source files
  const srcDir = path.join(__dirname, '../../src');
  const { staticKeys, dynamicKeys } = extractTranslationKeys(srcDir);
  console.log(`\n🔎 Extracted translation keys from source:`);
  console.log(`   - Static keys: ${staticKeys.size}`);
  console.log(`   - Dynamic key patterns: ${dynamicKeys.size}`);

  // Save used keys
  const usedKeysPath = path.join(__dirname, 'used-translation-keys.json');
  const usedKeysData = {
    staticKeys: Array.from(staticKeys).sort(),
    dynamicPatterns: Array.from(dynamicKeys).sort()
  };
  fs.writeFileSync(usedKeysPath, JSON.stringify(usedKeysData, null, 2));
  console.log(`   ✓ Saved to: ${usedKeysPath}\n`);

  // 3. Compare and find unused keys
  const definedKeys = Object.keys(flattenedTranslations);

  // Separate safe keys from unused keys
  const safeKeysFound = [];
  const unusedKeys = definedKeys.filter(key => {
    // Check if it's a safe key
    if (isSafeKey(key, safeConfig)) {
      safeKeysFound.push(key);
      return false;
    }

    // Check if used as static key
    if (staticKeys.has(key)) return false;

    // Check if matches any dynamic pattern
    for (const pattern of dynamicKeys) {
      const [prefix, suffix] = pattern.split('*');
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        return false;
      }
    }

    return true;
  });

  const undefinedKeys = Array.from(staticKeys).filter(key => !flattenedTranslations.hasOwnProperty(key));

  console.log('📊 Analysis Results:');
  console.log(`   - Total keys in en.json: ${definedKeys.length}`);
  console.log(`   - Static keys used in source: ${staticKeys.size}`);
  console.log(`   - Dynamic key patterns: ${dynamicKeys.size}`);
  console.log(`   - Safe keys (ignored): ${safeKeysFound.length}`);
  console.log(`   - Unused keys: ${unusedKeys.length}`);
  console.log(`   - Undefined keys (used but not in en.json): ${undefinedKeys.length}`);

  // Save analysis results
  const analysisResults = {
    summary: {
      totalKeysInEnJson: definedKeys.length,
      staticKeysUsedInSource: staticKeys.size,
      dynamicKeyPatterns: dynamicKeys.size,
      safeKeysCount: safeKeysFound.length,
      unusedKeysCount: unusedKeys.length,
      undefinedKeysCount: undefinedKeys.length
    },
    unusedKeys: unusedKeys.sort(),
    undefinedKeys: undefinedKeys.sort(),
    dynamicPatterns: Array.from(dynamicKeys).sort(),
    safeKeys: safeKeysFound.sort()
  };

  const resultsPath = path.join(__dirname, 'i18n-analysis-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(analysisResults, null, 2));
  console.log(`\n📁 Complete analysis saved to: ${resultsPath}`);

  // Print some unused keys for review
  if (unusedKeys.length > 0) {
    console.log('\n⚠️  Sample of unused keys (first 10):');
    unusedKeys.slice(0, 10).forEach(key => {
      console.log(`   - ${key}: "${flattenedTranslations[key]}"`);
    });
    if (unusedKeys.length > 10) {
      console.log(`   ... and ${unusedKeys.length - 10} more`);
    }
  }

  // Print undefined keys if any
  if (undefinedKeys.length > 0) {
    console.log('\n❌ Keys used in code but not defined in en.json:');
    undefinedKeys.forEach(key => {
      console.log(`   - ${key}`);
    });
  }

  // Print dynamic patterns found
  if (dynamicKeys.size > 0) {
    console.log('\n🔄 Dynamic key patterns found:');
    dynamicKeys.forEach(pattern => {
      console.log(`   - ${pattern}`);
    });
  }

  // Print safe keys found
  if (safeKeysFound.length > 0) {
    console.log('\n🛡️  Safe keys (preserved):');
    safeKeysFound.slice(0, 10).forEach(key => {
      console.log(`   - ${key}`);
    });
    if (safeKeysFound.length > 10) {
      console.log(`   ... and ${safeKeysFound.length - 10} more`);
    }
  }

  console.log('\n✅ Analysis complete!');
}

// Run the analysis
analyzeI18n();
