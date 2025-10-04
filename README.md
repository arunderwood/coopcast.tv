# CoopCast.tv 🐔

A Gatsby-based website that streams a live YouTube feed of chickens and displays their interactive family tree. Watch the flock from anywhere in the world and explore their genealogy!

## Features

- **🎥 Live Stream**: 24/7 YouTube livestream embedded on the homepage
- **🌳 Family Tree**: Interactive GEDCOM-based genealogy viewer with mobile support
- **📝 GEDCOM Management**: Claude Code slash commands for easy chicken record keeping
- **🧬 Breed Tracking**: Custom `_BREED` tags for documenting chicken breeds
- **📱 Mobile Responsive**: Optimized viewing experience on all devices

## Quick Start

### Development Server

```bash
cd frontend
npm install
npm run develop
```

Visit [http://localhost:8000](http://localhost:8000) to view the site.

### View Family Tree

Navigate to [http://localhost:8000/family-tree](http://localhost:8000/family-tree) to explore the chicken genealogy.

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI agent guidance for working with this codebase
- **[frontend/data/README.md](frontend/data/README.md)** - Comprehensive GEDCOM documentation and management guide
- **[.claude/commands/](.claude/commands/)** - Claude Code slash commands for GEDCOM management

### Managing Chicken Records

Use Claude Code slash commands to manage the flock:

```bash
/add-chicken Buttercup Sunshine      # Add new chicken
/update-chicken Henrietta            # Update existing chicken
/add-family Duke, Ruby               # Create family relationships
/mark-deceased Nugget                # Mark chicken as deceased
/list-chickens                       # List all chickens
/validate-flock                      # Validate GEDCOM file
```

See [frontend/data/README.md](frontend/data/README.md) for complete GEDCOM management documentation.

## Project Structure

```
coopcast.tv/
├── .claude/                 # Claude Code tooling (agents & slash commands)
├── frontend/                # Gatsby application
│   ├── data/                # GEDCOM family tree data
│   ├── src/
│   │   ├── components/      # React components (layout, FamilyTree)
│   │   ├── pages/           # Gatsby pages (index, family-tree, 404)
│   │   ├── utils/           # Shared utilities (gedcom-validator)
│   │   └── __tests__/       # Jest tests
│   ├── gatsby-config.js     # Gatsby configuration
│   └── gatsby-node.js       # Build-time GEDCOM parsing
├── scripts/                 # Utility scripts (validate-gedcom.js)
└── .github/workflows/       # CI/CD (ESLint, tests)
```

## Technology Stack

- **Frontend**: [Gatsby](https://www.gatsbyjs.com/) v5, React 18
- **Video**: [react-youtube](https://www.npmjs.com/package/react-youtube)
- **Family Tree**: [d3-org-chart](https://github.com/bumbeishvili/org-chart)
- **GEDCOM Parser**: [read-gedcom](https://github.com/arbre-app/read-gedcom)
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## Development

### Commands

All commands run from `frontend/` directory:

```bash
npm run develop    # Start dev server (http://localhost:8000)
npm run build      # Build for production
npm run serve      # Serve production build locally
npm test           # Run Jest tests
npm run lint       # Run ESLint
npm run clean      # Clean Gatsby cache
```

### Testing

```bash
cd frontend
npm test                                          # Run all tests
node ../scripts/validate-gedcom.js data/chickens.ged  # Validate GEDCOM
```

### GraphQL Explorer

When dev server is running: [http://localhost:8000/___graphql](http://localhost:8000/___graphql)

Query chicken data:
```graphql
{
  allChicken {
    nodes {
      fullName
      breed
      birthDate
      isDeceased
      notes
    }
  }
}
```

## GEDCOM Family Tree

The chicken family tree is stored in [frontend/data/chickens.ged](frontend/data/chickens.ged) using the GEDCOM 5.5.1 format.

### Key Features

- **Custom `_BREED` Tag**: Tracks chicken breeds (e.g., "Blue Cochin", "Rhode Island Red")
- **Human-Friendly Notes**: NOTE fields use chicken names, not internal @ID@ references
- **Cross-Reference Validation**: Automatic validation of family relationships
- **Statistics Tracking**: Living vs deceased counts, family structure

### Visualization

The family tree displays:
- 🐓 Roosters / 🐔 Hens / 🥚 Unknown gender
- 🏆 Breed information
- 🎂 Birth dates
- 🪦 Deceased markers with dates
- 📝 Notes (truncated on mobile)

Fully expanded by default with touch gestures on mobile (pinch to zoom, swipe to pan).

## Contributing

1. Make changes to chicken records using slash commands or manual GEDCOM editing
2. Validate: `node scripts/validate-gedcom.js frontend/data/chickens.ged`
3. Test: `npm test` from `frontend/`
4. Build: `npm run build` from `frontend/`

## License

This project combines experimentation with GatsbyJS and the desire to watch chickens from anywhere. 🐔❤️

## Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [GEDCOM 5.5.1 Specification](https://gedcom.io/specifications/ged551.pdf)
- [d3-org-chart Documentation](https://github.com/bumbeishvili/org-chart)
