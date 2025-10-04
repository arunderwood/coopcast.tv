---
description: Validate the GEDCOM file integrity
---

✅ Use the **chicken-genealogist** subagent to validate `frontend/data/chickens.ged`

The subagent should:
1. Run the validation script: `node scripts/validate-gedcom.js frontend/data/chickens.ged`
2. Parse and present the validation results:
   - GEDCOM syntax validation status
   - File statistics (total chickens, living, deceased, families)
   - Any cross-reference errors or warnings
   - Missing or invalid ID references
3. If errors are found:
   - Explain what each error means
   - Suggest how to fix them
4. If validation passes:
   - Confirm all data is valid
   - Show the current flock statistics

This command is useful to run after manual edits or to verify the integrity of the family tree data.
