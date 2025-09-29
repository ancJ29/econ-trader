#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { flattenObject, unflattenObject, sortObjectKeys } = require('./helpers.cjs');

// Configuration
const ANALYSIS_RESULTS_FILE = 'i18n-analysis-results.json';
const LOCALE_DIR = '../../src/locales';
const SUPPORTED_LANGUAGES = ['en', 'ja'];

// Function to remove keys from flattened object
function removeFlattenedKeys(flatObj, keysToRemove) {
  const result = { ...flatObj };
  keysToRemove.forEach(key => {
    delete result[key];
  });
  return result;
}

// Function to create backup file
function createBackup(filePath) {
  const backupPath = filePath.replace('.json', '.backup.json');
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Function to process language file
function processLanguageFile(lang, unusedKeys) {
  const filePath = path.join(__dirname, LOCALE_DIR, `${lang}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    // Load and flatten translations
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const flattened = flattenObject(translations);

    // Count keys before removal
    const keysBefore = Object.keys(flattened).length;

    // Remove unused keys from flattened object
    const cleaned = removeFlattenedKeys(flattened, unusedKeys);

    // Count keys after removal
    const keysAfter = Object.keys(cleaned).length;
    const removedCount = keysBefore - keysAfter;

    // Create backup
    const backupPath = createBackup(filePath);
    console.log(`   📁 Backup: ${path.basename(backupPath)}`);

    // Unflatten and sort
    const unflattened = unflattenObject(cleaned);
    const sorted = sortObjectKeys(unflattened);

    // Save cleaned version
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n');
    console.log(`   ✅ Updated: ${path.basename(filePath)} (removed ${removedCount} keys)`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error processing ${lang}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🧹 i18n Cleanup Tool\n');

  // Load analysis results
  const resultsPath = path.join(__dirname, ANALYSIS_RESULTS_FILE);

  if (!fs.existsSync(resultsPath)) {
    console.error(`❌ Analysis results not found: ${ANALYSIS_RESULTS_FILE}`);
    console.log('   Please run analyze-i18n.cjs first to generate analysis results.');
    process.exit(1);
  }

  let results;
  try {
    results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  } catch (error) {
    console.error('❌ Failed to parse analysis results:', error.message);
    process.exit(1);
  }

  // Check if there are unused keys
  if (!results.unusedKeys || results.unusedKeys.length === 0) {
    console.log('✅ No unused keys to remove!');
    if (results.safeKeys && results.safeKeys.length > 0) {
      console.log(`   ${results.safeKeys.length} safe keys are preserved.`);
    }
    process.exit(0);
  }

  // Display summary
  console.log('📊 Summary:');
  console.log(`   Unused keys: ${results.unusedKeys.length}`);
  if (results.safeKeys && results.safeKeys.length > 0) {
    console.log(`   Safe keys: ${results.safeKeys.length} (preserved)`);
  }

  // Display sample of unused keys
  console.log('\n🗑️  Keys to remove (first 10):');
  const sampleKeys = results.unusedKeys.slice(0, 10);
  sampleKeys.forEach(key => console.log(`   - ${key}`));
  if (results.unusedKeys.length > 10) {
    console.log(`   ... and ${results.unusedKeys.length - 10} more`);
  }

  // Confirmation prompt
  console.log('\n⚠️  This will modify translation files!');
  console.log('   Languages to update:', SUPPORTED_LANGUAGES.join(', '));
  console.log('\nPress Enter to continue or Ctrl+C to cancel...');

  // Wait for confirmation
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.once('data', (data) => {
    process.stdin.setRawMode(false);
    process.stdin.pause();

    // Check for Ctrl+C (ASCII 3)
    if (data[0] === 3) {
      console.log('\nCancelled.');
      process.exit(0);
    }

    console.log('\n🔄 Processing files...\n');

    // Process each language file
    let allSuccess = true;
    SUPPORTED_LANGUAGES.forEach(lang => {
      console.log(`📄 Processing ${lang}:`);
      const success = processLanguageFile(lang, results.unusedKeys);
      if (!success) {
        allSuccess = false;
      }
      console.log('');
    });

    // Final status
    if (allSuccess) {
      console.log('✅ Cleanup complete!');
      console.log('\n📝 Next steps:');
      console.log('   1. Review the changes with git diff');
      console.log('   2. Run yarn type-check to verify');
      console.log('   3. Test the application');
      console.log('   4. Delete backup files when satisfied');
    } else {
      console.log('⚠️  Some files failed to process. Check errors above.');
      process.exit(1);
    }
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}
