#!/usr/bin/env node

/**
 * GEDCOM Validation Script
 *
 * Validates GEDCOM files for syntax and cross-reference integrity.
 * Used by CI/CD and can be run manually.
 *
 * Usage: node scripts/validate-gedcom.js <path-to-gedcom-file>
 */

const fs = require('fs');
const path = require('path');

// Import shared validation logic
const { validateGedcom, formatValidationReport } = require('../frontend/src/utils/gedcom-validator.js');

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate-gedcom.js <path-to-gedcom-file>');
    console.error('Example: node validate-gedcom.js frontend/data/chickens.ged');
    process.exit(1);
  }

  const filePath = args[0];

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    console.log(`\n🐔 Validating GEDCOM file: ${filePath}\n`);

    // Read GEDCOM file as buffer (read-gedcom expects buffer, not string)
    const gedcomBuffer = fs.readFileSync(filePath);

    // Dynamically require read-gedcom from frontend node_modules
    const frontendDir = path.join(__dirname, '..', 'frontend');
    const { parseGedcom, selectGedcom } = require(path.join(frontendDir, 'node_modules', 'read-gedcom'));

    // Parse GEDCOM
    let gedcom;
    try {
      gedcom = parseGedcom(gedcomBuffer);
    } catch (parseError) {
      console.error(`❌ GEDCOM parsing failed: ${parseError.message}`);
      console.error('   The file may not be a valid GEDCOM file or may be corrupted.');
      process.exit(1);
    }

    const selection = selectGedcom(gedcom);

    // Extract individuals and families
    const individualRecords = selection.getIndividualRecord();
    const familyRecords = selection.getFamilyRecord();

    const individualArray = Array.isArray(individualRecords) ? individualRecords : Array.from(individualRecords);
    const familyArray = Array.isArray(familyRecords) ? familyRecords : Array.from(familyRecords);

    // Validate using shared module
    const result = validateGedcom(individualArray, familyArray);

    // Format and display report
    const fileName = path.basename(filePath);
    console.log(formatValidationReport(result, fileName));
    console.log('');

    // Exit with appropriate code
    process.exit(result.isValid ? 0 : 1);

  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
