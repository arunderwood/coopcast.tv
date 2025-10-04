---
description: Add a new chicken to the flock
argument-hint: "[given-name] [surname]"
---

🐔 Use the **chicken-genealogist** subagent to add a new chicken to the flock.

Chicken name: $ARGUMENTS

The subagent should:
1. Collect any additional required information (gender, birth date, notes, parent family)
2. Generate a unique @I##@ ID for the new chicken
3. Create a properly formatted INDI record in GEDCOM format
4. Add the record to `frontend/data/chickens.ged` before the TRLR tag
5. Validate the GEDCOM file using the validation script
6. Report success and show the new chicken's details
