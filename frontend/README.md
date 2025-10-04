# CoopCast.tv Frontend

Gatsby-based frontend for streaming chicken video and displaying their family tree.

## Quick Start

```bash
npm install
npm run develop
```

Visit [http://localhost:8000](http://localhost:8000)

## Pages

- **`/`** - Homepage with live YouTube stream
- **`/family-tree`** - Interactive GEDCOM-based genealogy viewer
- **`/404`** - Error page

## Development Commands

```bash
npm run develop    # Start dev server (http://localhost:8000)
npm run build      # Build for production
npm run serve      # Serve production build
npm test           # Run Jest tests
npm run lint       # Run ESLint
npm run clean      # Clean Gatsby cache
```

## Project Structure

```
frontend/
├── data/                    # Data files
│   ├── chickens.ged         # GEDCOM family tree (see data/README.md)
│   └── README.md            # Complete GEDCOM documentation
├── src/
│   ├── components/          # React components
│   │   ├── layout.js        # Layout wrapper
│   │   ├── layout.css       # Global styles
│   │   ├── FamilyTree.js    # Family tree visualization (d3-org-chart)
│   │   └── FamilyTree.css   # Family tree styles
│   ├── pages/               # Gatsby pages (auto-routed)
│   │   ├── index.js         # Homepage (YouTube stream)
│   │   ├── family-tree.js   # Family tree page
│   │   └── 404.js           # Error page
│   ├── utils/               # Utility modules
│   │   └── gedcom-validator.js  # Shared GEDCOM validation logic
│   ├── __tests__/           # Jest tests
│   │   ├── fixtures/
│   │   │   └── sample.ged   # Test GEDCOM fixture
│   │   ├── FamilyTree.test.js
│   │   └── gedcom-parser.test.js
│   └── images/              # Static assets
├── gatsby-config.js         # Gatsby configuration
├── gatsby-node.js           # Build-time data sourcing (GEDCOM parsing)
├── package.json             # Dependencies
├── jest.config.js           # Jest configuration
└── .eslintrc.js             # ESLint configuration
```

## Key Features

### GEDCOM Family Tree

The family tree is powered by GEDCOM data parsed at build time:

1. **Data Source**: `data/chickens.ged` (GEDCOM 5.5.1 format)
2. **Parser**: `gatsby-node.js` reads GEDCOM → creates GraphQL nodes
3. **GraphQL Nodes**: `Chicken` and `ChickenFamily` types
4. **Visualization**: `FamilyTree.js` uses d3-org-chart library
5. **Validation**: Shared `utils/gedcom-validator.js` module

See [data/README.md](data/README.md) for complete GEDCOM management documentation.

### GraphQL Schema

```graphql
type Chicken {
  id: ID!
  gedcomId: String!
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

Explore schema: [http://localhost:8000/___graphql](http://localhost:8000/___graphql)

### Mobile Responsive Design

The family tree adapts to screen size:
- **Mobile** (<768px): Compact nodes (180×90), touch gestures
- **Tablet** (768-1024px): Medium nodes (200×100)
- **Desktop** (>1024px): Full nodes (250×120)

## Testing

```bash
npm test                                    # Run all tests
npm test -- --watch                         # Watch mode
npm test -- --coverage                      # Coverage report
node ../scripts/validate-gedcom.js data/chickens.ged  # Validate GEDCOM
```

Tests validate:
- GEDCOM parser functionality (using test fixture)
- Real `chickens.ged` file integrity
- React component rendering
- Cross-reference validation

## Dependencies

### Core
- **gatsby** ^5.15.0 - Static site generator
- **react** ^18.3.1 - UI library
- **react-dom** ^18.3.1 - DOM rendering

### Gatsby Plugins
- **gatsby-plugin-manifest** - PWA manifest
- **gatsby-plugin-mdx** - MDX support
- **gatsby-source-filesystem** - File system data

### Family Tree
- **d3-org-chart** ^3.1.1 - Org chart visualization
- **react-youtube** ^10.1.0 - YouTube embed
- **read-gedcom** ^5.0.0 - GEDCOM parser

### Testing
- **jest** ^29.7.0 - Test runner
- **@testing-library/react** ^16.0.1 - React testing utilities
- **babel-jest** ^29.7.0 - Babel transformation

## Build-Time Data Processing

`gatsby-node.js` creates GraphQL nodes from GEDCOM data:

```javascript
exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  // 1. Read GEDCOM file as buffer
  const gedcomBuffer = fs.readFileSync('data/chickens.ged');

  // 2. Parse with read-gedcom
  const tree = parseGedcom(gedcomBuffer);
  const selection = selectGedcom(tree);

  // 3. Transform to GraphQL nodes
  const { individuals, families } = transformGedcomToFamilyTree(selection);

  // 4. Create Chicken and ChickenFamily nodes
  individuals.forEach(chicken => createNode({ ...chicken, type: 'Chicken' }));
  families.forEach(family => createNode({ ...family, type: 'ChickenFamily' }));
};
```

## Environment

- **Node.js**: v18+ recommended
- **npm**: v9+
- **Gatsby**: v5.15.0

## Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [React Documentation](https://react.dev/)
- [d3-org-chart](https://github.com/bumbeishvili/org-chart)
- [GEDCOM 5.5.1 Spec](https://gedcom.io/specifications/ged551.pdf)
