---
description: Update information for an existing chicken
argument-hint: "[chicken-name]"
---

🐔 Use the **chicken-genealogist** subagent to update information for: $ARGUMENTS

The subagent should:
1. Search for the chicken in `frontend/data/chickens.ged`
2. Show the current information
3. Ask what information to update (name, birth date, gender, notes, etc.)
4. Update the GEDCOM record while preserving proper structure
5. Validate the changes using the validation script
6. Report what was changed and show the updated record
