---
description: Mark a chicken as deceased
argument-hint: "[chicken-name]"
---

† Use the **chicken-genealogist** subagent to mark a chicken as deceased: $ARGUMENTS

The subagent should:
1. Search for the chicken in `frontend/data/chickens.ged`
2. Show the chicken's current information
3. Ask for the date of passing (format: DD MMM YYYY)
4. Ask if there should be a memorial note added
5. Add a DEAT (death) record with the date to the INDI record
6. Optionally update or add to the NOTE field with memorial information
7. Validate the GEDCOM file
8. Show a respectful message with the updated record

Handle this task with care and empathy.
