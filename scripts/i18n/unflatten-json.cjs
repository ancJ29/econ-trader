#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sortObjectKeys, unflattenObject } = require('./helpers.cjs');

// Function to split merged translations by language
function splitMergedTranslations(mergedTranslations) {
  const translationsByLang = {};

  for (const key in mergedTranslations) {
    // Split by first colon to get language and translation key
    const colonIndex = key.indexOf(':');
    if (colonIndex === -1) {
      console.warn(`⚠️  Invalid key format (missing language prefix): ${key}`);
      continue;
    }

    const lang = key.substring(0, colonIndex);
    const translationKey = key.substring(colonIndex + 1);

    if (!translationsByLang[lang]) {
      translationsByLang[lang] = {};
    }

    translationsByLang[lang][translationKey] = mergedTranslations[key];
  }

  return translationsByLang;
}

// Main re-sync function for a language
function resyncTranslations(lang, flattenedTranslations) {
  console.log(`🔄 Re-syncing ${lang} translations...`);

  try {
    console.log(`   📄 Processing ${Object.keys(flattenedTranslations).length} keys`);

    // 1. Unflatten back to nested structure
    const nestedTranslations = unflattenObject(flattenedTranslations);

    // 2. Sort keys alphabetically for consistent output
    const sortedTranslations = sortObjectKeys(nestedTranslations);

    // 3. Save to original locale file
    const localePath = path.join(__dirname, `../../src/locales/${lang}.json`);

    // Create backup of current file
    if (fs.existsSync(localePath)) {
      const backupPath = path.join(__dirname, `../../src/locales/${lang}.backup.json`);
      fs.copyFileSync(localePath, backupPath);
      console.log(`   ✓ Backup created: ${backupPath}`);
    }

    // Write the unflattened translations
    fs.writeFileSync(localePath, JSON.stringify(sortedTranslations, null, 2) + '\n');
    console.log(`   ✓ Updated: ${localePath}`);

    // 4. Verify the structure
    const verifyData = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    const topLevelKeys = Object.keys(verifyData);
    console.log(`   ✓ Verified structure: ${topLevelKeys.length} top-level keys`);
    console.log(
      `     Keys: ${topLevelKeys.slice(0, 5).join(', ')}${topLevelKeys.length > 5 ? '...' : ''}`,
    );

    return true;
  } catch (error) {
    console.error(`❌ Error processing ${lang}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚀 Starting translation re-sync from merged flattened file...\n');
console.log('⚠️  WARNING: This will overwrite src/locales/[lang].json files!');
console.log('   Backups will be created as src/locales/[lang].backup.json\n');

// Load merged flattened file
const mergedPath = path.join(__dirname, 'flattened', 'merged-flattened.json');

if (!fs.existsSync(mergedPath)) {
  console.error(`❌ Merged flattened file not found: ${mergedPath}`);
  console.log(`   Please run flatten-json.cjs first to generate the merged flattened file.`);
  process.exit(1);
}

const mergedTranslations = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
console.log(`📄 Loaded merged-flattened.json: ${Object.keys(mergedTranslations).length} total keys\n`);

// Split by language
const translationsByLang = splitMergedTranslations(mergedTranslations);
const languages = Object.keys(translationsByLang).sort();

console.log(`🌐 Found ${languages.length} languages: ${languages.join(', ')}\n`);

// Process each language
let allSuccess = true;
for (const lang of languages) {
  const success = resyncTranslations(lang, translationsByLang[lang]);
  if (!success) {
    allSuccess = false;
  }
  console.log('');
}

if (allSuccess) {
  console.log('✅ All translations re-synced successfully!');
  console.log('\n📝 Notes:');
  console.log('   - Original files have been backed up as [lang].backup.json');
  console.log('   - Keys are sorted alphabetically for consistency');
  console.log('   - The nested structure has been restored from the merged flattened file');
} else {
  console.log('⚠️  Some translations failed to re-sync. Please check the errors above.');
  process.exit(1);
}
