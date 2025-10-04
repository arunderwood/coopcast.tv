---
description: Create a family relationship between chickens
argument-hint: "[rooster-name] [hen-name]"
---

🐔 Use the **chicken-genealogist** subagent to create a family relationship.

Parents: $ARGUMENTS

The subagent should:
1. Find both parent chickens in the GEDCOM file by name
2. Generate a unique @F##@ family ID
3. Ask for additional information (marriage date, children)
4. Create the FAM record in GEDCOM format
5. Update both parent INDI records with FAMS (family as spouse) references
6. If children are specified, update their FAMC (family as child) references
7. Add all records to `frontend/data/chickens.ged`
8. Validate the GEDCOM file
9. Show the complete family structure with all relationships
