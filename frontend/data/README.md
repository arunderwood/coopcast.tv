# Chicken Family Tree - GEDCOM Data

This directory contains the GEDCOM file that defines the chicken family tree displayed on CoopCast.tv at `/family-tree`.

## Quick Links

- **GEDCOM File**: [chickens.ged](chickens.ged)
- **Validation Script**: [../../scripts/validate-gedcom.js](../../scripts/validate-gedcom.js)
- **View Live**: [http://localhost:8000/family-tree](http://localhost:8000/family-tree) (dev server)

## What is GEDCOM?

GEDCOM (Genealogical Data Communication) is a standard file format for exchanging genealogical data. It was created by The Church of Jesus Christ of Latter-day Saints and is widely supported by genealogy software.

## Updating the Family Tree

### Option 1: Claude Code Slash Commands (Recommended)

The easiest way to manage chicken genealogy is using the built-in Claude Code commands:

```bash
/add-chicken Buttercup Sunshine       # Add new chicken
/update-chicken Henrietta             # Update existing chicken
/add-family Duke, Ruby                # Create family relationship
/mark-deceased Nugget                 # Mark chicken as deceased
/list-chickens                        # List all chickens
/validate-flock                       # Validate GEDCOM file
```

These commands use the **chicken-genealogist** expert subagent that:
- Generates unique IDs automatically (@I##@, @F##@)
- Validates all changes with proper cross-references
- Maintains GEDCOM 5.5.1 format compliance
- Keeps NOTE fields human-friendly (no internal @ID@ references)
- Tracks breeds using the `_BREED` custom tag

See [.claude/commands/](../../.claude/commands/) for all available commands.

### Option 2: Manual Editing (Simple Changes)

For quick updates like adding a note:

1. Open `chickens.ged` in a text editor
2. Find the individual (search for their name)
3. Make changes following GEDCOM format (see examples below)
4. Validate: `node ../../scripts/validate-gedcom.js chickens.ged`
5. Restart dev server to see changes

### Option 3: Genealogy Software (Complex Changes)

For major restructuring, use genealogy software:

**Free Options**:
- [Gramps](https://gramps-project.org/) (Windows, Mac, Linux)
- [GeneWeb](https://geneweb.tuxfamily.org/) (Web-based)
- [Ancestris](https://www.ancestris.org/) (Java-based, cross-platform)

**Steps**:
1. Import `chickens.ged`
2. Make changes in the software
3. Export to GEDCOM format
4. Replace `chickens.ged` with new version
5. Validate and rebuild

## GEDCOM Structure Quick Reference

### Individual Record

```gedcom
0 @I12@ INDI
1 NAME Buttercup /Sunshine/
2 GIVN Buttercup
2 SURN Sunshine
1 SEX F
1 BIRT
2 DATE 15 MAR 2025
1 _BREED Rhode Island Red
1 NOTE A friendly hen who loves sunflower seeds.
1 FAMC @F1@
1 FAMS @F5@
```

### Family Record

```gedcom
0 @F5@ FAM
1 HUSB @I1@
1 WIFE @I6@
1 CHIL @I12@
1 CHIL @I13@
1 MARR
2 DATE SEP 2024
1 NOTE Lulu and Moe took turns incubating the eggs.
```

### Mark as Deceased

```gedcom
1 DEAT
2 DATE 15 DEC 2024
```

## Field Reference

### Required Fields
- **NAME**: Format `GivenName /Surname/`
- **SEX**: M (rooster), F (hen), U (unknown)

### Optional Fields
- **BIRT**: Birth event with DATE subfield
- **DEAT**: Death event with DATE subfield (auto-displays 🪦 in tree)
- **_BREED**: Custom tag for chicken breed (e.g., "Blue Cochin", "Silkie")
- **NOTE**: Human-readable notes (displayed in tree with 📝 emoji)
- **FAMC**: Family As Child - links to parent family @F##@
- **FAMS**: Family As Spouse - links to family where this chicken is a parent

### Date Format
- Full: `DD MMM YYYY` (e.g., `15 MAR 2020`)
- Partial: `MMM YYYY` (e.g., `SEP 2024`)
- Year only: `YYYY` (e.g., `2023`)
- Month abbreviations must be uppercase: JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC

## Family Tree Visualization

The family tree at `/family-tree` displays:

- **🐓 Roosters** / **🐔 Hens** / **🥚 Unknown gender**
- **🏆 Breed** information (from `_BREED` tag)
- **🎂 Birth dates** with emoji
- **🪦 Deceased markers** with death dates
- **📝 Notes** in italics (truncated on mobile: 40 chars, desktop: 80 chars)

The tree is:
- Fully expanded by default
- Mobile responsive (touch gestures: pinch to zoom, swipe to pan)
- Powered by d3-org-chart library

## GraphQL Schema

The GEDCOM data is exposed via Gatsby GraphQL:

```graphql
type Chicken {
  id: ID!
  gedcomId: String!
  givenName: String!
  surname: String!
  fullName: String!
  gender: String!
  birthDate: String
  deathDate: String
  isDeceased: Boolean!
  breed: String              # From _BREED custom tag
  notes: [String!]!
  parentFamilyId: String
  spouseFamilyIds: [String!]!
}

type ChickenFamily {
  id: ID!
  gedcomId: String!
  husband: String
  wife: String
  childrenIds: [String!]!
}
```

Query example:
```graphql
{
  allChicken {
    nodes {
      fullName
      breed
      birthDate
      notes
    }
  }
}
```

Test queries at [http://localhost:8000/___graphql](http://localhost:8000/___graphql)

## Validation

Always validate after making changes:

```bash
node ../../scripts/validate-gedcom.js chickens.ged
```

The script checks:
- GEDCOM syntax validity
- Cross-reference integrity (all @ID@ references exist)
- Family relationship consistency
- Statistics (total chickens, living, deceased, families)

## Important Rules

1. **Unique IDs**: Each `@I##@` and `@F##@` must be unique
2. **Human-Friendly Notes**: Never put @ID@ references in NOTE fields - use chicken names instead
3. **Breed Tracking**: Use `1 _BREED <name>` not mixed into NOTE field
4. **UTF-8 Encoding**: Always save files as UTF-8
5. **File Structure**: Must start with `0 HEAD` and end with `0 TRLR`
6. **Buffer Format**: Gatsby reads as buffer (already handled in gatsby-node.js)

## Development Workflow

After updating `chickens.ged`:

1. **Validate**: Run validation script
2. **Auto-reload**: Gatsby dev server hot-reloads automatically
3. **Verify**: Check `/family-tree` page for visual updates
4. **Test**: Run `npm test` in frontend directory
5. **Commit**: Add changes to git

The data flow:
```
chickens.ged
    ↓ (gatsby-node.js parses at build time)
GraphQL nodes (Chicken & ChickenFamily)
    ↓ (family-tree.js queries)
FamilyTree component
    ↓ (d3-org-chart renders)
Interactive family tree
```

## Troubleshooting

**Tree doesn't display after update:**
1. Check dev server logs for parsing errors
2. Run validation script: `node ../../scripts/validate-gedcom.js chickens.ged`
3. Verify all @ID@ references exist
4. Check GraphiQL for node data: [http://localhost:8000/___graphql](http://localhost:8000/___graphql)
5. Look for browser console errors
6. Restart dev server: `npm run develop` from frontend/

**Validation errors:**
- **"Cannot find @Ixx@"**: Referenced ID doesn't exist, check FAMC/FAMS/HUSB/WIFE/CHIL tags
- **"Probably not a Gedcom file"**: File format corrupted, check header (0 HEAD) and trailer (0 TRLR)
- **"Invalid date"**: Use proper format DD MMM YYYY with uppercase month abbreviations

**Visual display issues:**
- Breed not showing: Check `_BREED` tag spelling (must be exactly `_BREED`, not `_breed`)
- Notes truncated: Expected behavior (40 chars mobile, 80 desktop) - full text in data
- Tree not expanded: Check `.initialExpandLevel(999)` in FamilyTree.js

## Resources

- [GEDCOM 5.5.1 Specification](https://gedcom.io/specifications/ged551.pdf)
- [FamilySearch GEDCOM Documentation](https://gedcom.io/)
- [Gramps User Manual](https://www.gramps-project.org/wiki/index.php/Gramps_5.1_Wiki_Manual)
- [d3-org-chart Documentation](https://github.com/bumbeishvili/org-chart)
- [read-gedcom Parser](https://github.com/arbre-app/read-gedcom)

## Contributing

When adding new features to the family tree:

1. Update GraphQL schema in `gatsby-node.js` `createSchemaCustomization()`
2. Add parsing logic in `gatsby-node.js` `transformGedcomToFamilyTree()`
3. Update query in `src/pages/family-tree.js`
4. Enhance display in `src/components/FamilyTree.js` `nodeContent()`
5. Add tests in `src/__tests__/`
6. Update this README with new field documentation

## License

Same as main CoopCast.tv project.
