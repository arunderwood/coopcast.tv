---
description: List all chickens in the flock
argument-hint: "[all|living|deceased]"
---

🐔 Use the **chicken-genealogist** subagent to list chickens in the flock.

Filter: $ARGUMENTS (defaults to "all" if not specified)

The subagent should:
1. Parse `frontend/data/chickens.ged` to extract all chicken records
2. Apply the requested filter:
   - "all" or empty: show all chickens
   - "living": show only living chickens (no DEAT record)
   - "deceased": show only deceased chickens (has DEAT record)
3. Display a formatted table with:
   - ID (@I##@)
   - Name
   - Gender (🐓 for roosters, 🐔 for hens)
   - Birth Date
   - Status (Living or † with death date)
   - Family relationships (parents, spouse, children)
4. Show summary statistics:
   - Total count
   - Living count
   - Deceased count
   - Number of families
