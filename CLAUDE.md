# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CoopCast.tv is a Gatsby-based website that streams a YouTube live feed of chickens. The project is a simple single-page application built with GatsbyJS v5, React 18, and react-youtube.

## Repository Structure

```
coopcast.tv/
├── .claude/                    # Claude Code tooling
│   ├── agents/                 # Custom AI agents
│   │   └── chicken-genealogist.md  # GEDCOM expert subagent
│   └── commands/               # Slash commands
│       ├── add-chicken.md
│       ├── update-chicken.md
│       ├── add-family.md
│       ├── mark-deceased.md
│       ├── list-chickens.md
│       └── validate-flock.md
├── frontend/                   # Gatsby application
│   ├── data/                   # Data files
│   │   ├── chickens.ged        # GEDCOM family tree data
│   │   └── README.md           # GEDCOM documentation
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── layout.js
│   │   │   ├── layout.css
│   │   │   ├── FamilyTree.js   # Family tree visualization
│   │   │   └── FamilyTree.css
│   │   ├── pages/              # Gatsby pages
│   │   │   ├── index.js        # Main page (YouTube stream)
│   │   │   ├── family-tree.js  # Family tree page
│   │   │   └── 404.js
│   │   ├── utils/              # Utility modules
│   │   │   └── gedcom-validator.js  # Shared GEDCOM validation
│   │   ├── __tests__/          # Jest tests
│   │   │   ├── fixtures/
│   │   │   │   └── sample.ged  # Test GEDCOM file
│   │   │   ├── FamilyTree.test.js
│   │   │   └── gedcom-parser.test.js
│   │   └── images/             # Static assets
│   ├── gatsby-config.js        # Gatsby configuration
│   ├── gatsby-node.js          # Build-time GEDCOM parsing
│   ├── package.json            # Dependencies and scripts
│   ├── jest.config.js          # Jest configuration
│   ├── jest.setup.js
│   ├── jest-preprocess.js
│   └── .eslintrc.js
├── scripts/                    # Utility scripts
│   └── validate-gedcom.js      # GEDCOM validation script
└── .github/workflows/          # CI/CD workflows
    ├── eslint.yml
    └── tests.yml
```

## Development Commands

All commands must be run from the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8000)
npm run develop
# or
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve

# Run linter
npm run lint

# Clean Gatsby cache and build artifacts
npm clean
```

## Key Architecture Details

### Gatsby Configuration
- Configured in `frontend/gatsby-config.js`
- Uses plugins: `gatsby-plugin-manifest`, `gatsby-plugin-mdx`, `gatsby-source-filesystem`
- Site metadata includes title and siteUrl

### Main Components
- **Layout component** (`src/components/layout.js`): Simple wrapper component with CSS import
- **Index page** (`src/pages/index.js`): Main page featuring YouTube embed with react-youtube library
  - Uses `YouTube` component with `videoId="PXe3D684sUA"`
  - Includes a custom `Head` export for page metadata and emoji favicon
- **404 page** (`src/pages/404.js`): Error page

### Styling
- CSS is located in `src/components/layout.css`
- No CSS-in-JS or styled-components; uses traditional CSS imports

### ESLint Configuration
- Extends `react-app` config
- Global `__PATH_PREFIX__` defined for Gatsby
- Ignores `public/` directory
- Runs in CI via GitHub Actions workflow (`.github/workflows/eslint.yml`)

## Family Tree Feature

The site includes an interactive chicken genealogy at `/family-tree`:

### Data & Architecture
- **GEDCOM file**: `frontend/data/chickens.ged` (GEDCOM 5.5.1 format)
- **Parser**: `frontend/gatsby-node.js` (parses at build time → GraphQL nodes)
- **Visualization**: `frontend/src/components/FamilyTree.js` (d3-org-chart library)
- **Validation**: `frontend/src/utils/gedcom-validator.js` (shared module)
- **Validation script**: `scripts/validate-gedcom.js` (CLI wrapper)

### GraphQL Nodes
- **Chicken**: fullName, gender, birthDate, deathDate, **breed** (_BREED custom tag), notes, family refs
- **ChickenFamily**: husband, wife, childrenIds

### GEDCOM Management via Slash Commands
- `/add-chicken [name]` - Add new chicken
- `/update-chicken [name]` - Update info
- `/add-family [rooster], [hen]` - Create relationships
- `/mark-deceased [name]` - Mark as deceased
- `/list-chickens [filter]` - List (all/living/deceased)
- `/validate-flock` - Validate GEDCOM

Commands delegate to **chicken-genealogist** subagent (`.claude/agents/chicken-genealogist.md`) which auto-generates IDs and validates format.

### Key Rules
- NOTE fields must be human-friendly (no @ID@ references - use chicken names)
- Breed tracking via `1 _BREED <breed name>` custom tag
- Tree is mobile-responsive, fully expanded by default
- Displays with emojis: 🐓/🐔/🥚 gender, 🏆 breed, 🎂 birth, 🪦 deceased, 📝 notes

## Testing and CI/CD

GitHub Actions workflows:
- **ESLint**: Runs on push/PR to main (`workflows/eslint.yml`)
- **Tests**: Runs Jest tests (`workflows/tests.yml`)

Run tests locally: `npm test` from `frontend/`

## Important Notes

- Working directory is `/Users/andrewunderwood/checkouts/coopcast.tv`
- All npm commands must be run from `frontend/` subdirectory
- The main video ID is hardcoded in `src/pages/index.js` as `PXe3D684sUA`
- Family tree data is at `frontend/data/chickens.ged`

### Visual Testing

When the Puppeteer MCP server is accessible, use it in combination with the Gatsby dev server to nativate, query, and visually inspect the built site.
- Gatsby dev server runs on host: `http://localhost:8000`
