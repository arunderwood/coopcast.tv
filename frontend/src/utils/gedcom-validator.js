/**
 * GEDCOM Validation Utilities
 *
 * Provides comprehensive validation for GEDCOM files including:
 * - Cross-reference integrity checking
 * - Statistics collection
 * - Error reporting
 */

/**
 * Validate GEDCOM cross-references and collect statistics
 * @param {Array} individuals - Array of individual records from read-gedcom
 * @param {Array} families - Array of family records from read-gedcom
 * @returns {Object} { isValid: boolean, errors: Array, stats: Object }
 */
function validateGedcom(individuals, families) {
  const errors = [];
  const stats = {
    individuals: 0,
    families: 0,
    deceased: 0,
    living: 0,
  };

  // Convert to arrays if they're iterators
  const individualArray = Array.isArray(individuals) ? individuals : Array.from(individuals);
  const familyArray = Array.isArray(families) ? families : Array.from(families);

  stats.individuals = individualArray.length;
  stats.families = familyArray.length;

  // Count deceased vs living
  individualArray.forEach((individual) => {
    const deathTag = individual.children?.find(c => c.tag === 'DEAT');
    if (deathTag) {
      stats.deceased++;
    } else {
      stats.living++;
    }
  });

  // Collect all valid IDs
  const individualIds = new Set(individualArray.map(i => i.pointer));
  const familyIds = new Set(familyArray.map(f => f.pointer));

  // Validate individual cross-references
  individualArray.forEach((individual) => {
    const id = individual.pointer;

    // Check FAMC (Family As Child) references
    const famcTags = individual.children?.filter(c => c.tag === 'FAMC') || [];
    famcTags.forEach((famc) => {
      if (famc.value && !familyIds.has(famc.value)) {
        errors.push(`Individual ${id} references non-existent family ${famc.value} in FAMC`);
      }
    });

    // Check FAMS (Family As Spouse) references
    const famsTags = individual.children?.filter(c => c.tag === 'FAMS') || [];
    famsTags.forEach((fams) => {
      if (fams.value && !familyIds.has(fams.value)) {
        errors.push(`Individual ${id} references non-existent family ${fams.value} in FAMS`);
      }
    });
  });

  // Validate family cross-references
  familyArray.forEach((family) => {
    const id = family.pointer;

    // Check husband reference
    const husbTag = family.children?.find(c => c.tag === 'HUSB');
    if (husbTag && husbTag.value && !individualIds.has(husbTag.value)) {
      errors.push(`Family ${id} references non-existent individual ${husbTag.value} as husband`);
    }

    // Check wife reference
    const wifeTag = family.children?.find(c => c.tag === 'WIFE');
    if (wifeTag && wifeTag.value && !individualIds.has(wifeTag.value)) {
      errors.push(`Family ${id} references non-existent individual ${wifeTag.value} as wife`);
    }

    // Check children references
    const chilTags = family.children?.filter(c => c.tag === 'CHIL') || [];
    chilTags.forEach((chil) => {
      if (chil.value && !individualIds.has(chil.value)) {
        errors.push(`Family ${id} references non-existent individual ${chil.value} as child`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    stats,
  };
}

/**
 * Format validation results for console output
 * @param {Object} result - Validation result from validateGedcom
 * @param {string} fileName - Name of the GEDCOM file
 * @returns {string} Formatted output string
 */
function formatValidationReport(result, fileName = 'GEDCOM file') {
  const lines = [];

  if (result.isValid) {
    lines.push(`✅ ${fileName} is valid`);
  } else {
    lines.push(`❌ ${fileName} has ${result.errors.length} error(s):`);
    result.errors.forEach((error, index) => {
      lines.push(`   ${index + 1}. ${error}`);
    });
  }

  lines.push('');
  lines.push('📊 Statistics:');
  lines.push(`   - Total chickens: ${result.stats.individuals}`);
  lines.push(`   - Living: ${result.stats.living} 🐔`);
  lines.push(`   - Deceased: ${result.stats.deceased} †`);
  lines.push(`   - Families: ${result.stats.families}`);

  return lines.join('\n');
}

// CommonJS exports for Node.js (validation script)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateGedcom,
    formatValidationReport,
  };
}

// ES6 exports for frontend/tests
export { validateGedcom, formatValidationReport };
