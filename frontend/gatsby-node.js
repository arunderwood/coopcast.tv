const fs = require('fs');
const path = require('path');
const { parseGedcom, selectGedcom } = require('read-gedcom');

/**
 * Helper to get child node by tag
 */
function getChildByTag(node, tag) {
  return node.children ? node.children.find(c => c.tag === tag) : null;
}

/**
 * Helper to get all children by tag
 */
function getChildrenByTag(node, tag) {
  return node.children ? node.children.filter(c => c.tag === tag) : [];
}

/**
 * Transform GEDCOM data into a format suitable for family-chart library
 * @param {Object} selection - Parsed GEDCOM selection
 * @returns {Object} Object with individuals and families arrays
 */
function transformGedcomToFamilyTree(selection) {
  const individuals = [];
  const families = [];

  // Extract individuals
  const individualRecords = selection.getIndividualRecord();
  const individualArray = Array.isArray(individualRecords) ? individualRecords : Array.from(individualRecords);

  individualArray.forEach((indi) => {
    const id = indi.pointer;

    // Get name
    const nameNode = getChildByTag(indi, 'NAME');
    let givenName = '';
    let surname = '';
    if (nameNode && nameNode.value) {
      const fullName = nameNode.value;
      const nameMatch = fullName.match(/(.+?)\/(.+)\//);
      if (nameMatch) {
        givenName = nameMatch[1].trim();
        surname = nameMatch[2].trim();
      } else {
        givenName = fullName.trim();
      }
    }

    // Get birth date
    let birthDate = null;
    const birthNode = getChildByTag(indi, 'BIRT');
    if (birthNode) {
      const dateNode = getChildByTag(birthNode, 'DATE');
      if (dateNode && dateNode.value) {
        birthDate = dateNode.value;
      }
    }

    // Get death date
    let deathDate = null;
    let isDeceased = false;
    const deathNode = getChildByTag(indi, 'DEAT');
    if (deathNode) {
      isDeceased = true;
      const dateNode = getChildByTag(deathNode, 'DATE');
      if (dateNode && dateNode.value) {
        deathDate = dateNode.value;
      }
    }

    // Get sex
    const sexNode = getChildByTag(indi, 'SEX');
    const gender = sexNode && sexNode.value ? sexNode.value : 'U';

    // Get breed (custom tag)
    const breedNode = getChildByTag(indi, '_BREED');
    const breed = breedNode && breedNode.value ? breedNode.value : null;

    // Get notes
    const notes = [];
    const noteNodes = getChildrenByTag(indi, 'NOTE');
    noteNodes.forEach((note) => {
      if (note.value) {
        notes.push(note.value);
      }
    });

    // Get family as child (parents)
    const famcNodes = getChildrenByTag(indi, 'FAMC');
    const parentFamilyId = famcNodes.length > 0 && famcNodes[0].value ? famcNodes[0].value : null;

    // Get families as spouse
    const famsNodes = getChildrenByTag(indi, 'FAMS');
    const spouseFamilyIds = famsNodes.map(f => f.value).filter(v => v);

    const gedcomId = id.replace(/@/g, '');
    individuals.push({
      id: gedcomId,
      gedcomId,
      givenName,
      surname,
      fullName: `${givenName} ${surname}`.trim(),
      gender,
      birthDate,
      deathDate,
      isDeceased,
      breed,
      notes,
      parentFamilyId: parentFamilyId ? parentFamilyId.replace(/@/g, '') : null,
      spouseFamilyIds: spouseFamilyIds.map(id => id.replace(/@/g, '')),
    });
  });

  // Extract families
  const familyRecords = selection.getFamilyRecord();
  const familyArray = Array.isArray(familyRecords) ? familyRecords : Array.from(familyRecords);

  familyArray.forEach((fam) => {
    const id = fam.pointer;

    const husbNode = getChildByTag(fam, 'HUSB');
    const husband = husbNode && husbNode.value ? husbNode.value.replace(/@/g, '') : null;

    const wifeNode = getChildByTag(fam, 'WIFE');
    const wife = wifeNode && wifeNode.value ? wifeNode.value.replace(/@/g, '') : null;

    const chilNodes = getChildrenByTag(fam, 'CHIL');
    const childrenIds = chilNodes.map(c => c.value).filter(v => v).map(v => v.replace(/@/g, ''));

    const gedcomId = id.replace(/@/g, '');
    families.push({
      id: gedcomId,
      gedcomId,
      husband,
      wife,
      childrenIds,
    });
  });

  return { individuals, families };
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  const typeDefs = `
    type Chicken implements Node {
      id: ID!
      gedcomId: String!
      givenName: String!
      surname: String!
      fullName: String!
      gender: String!
      birthDate: String
      deathDate: String
      isDeceased: Boolean!
      breed: String
      notes: [String!]!
      parentFamilyId: String
      spouseFamilyIds: [String!]!
    }

    type ChickenFamily implements Node {
      id: ID!
      gedcomId: String!
      husband: String
      wife: String
      childrenIds: [String!]!
    }
  `;

  createTypes(typeDefs);
};

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions;

  // Read GEDCOM file
  const gedcomPath = path.join(__dirname, 'data', 'chickens.ged');
  const gedcomBuffer = fs.readFileSync(gedcomPath);

  // Parse GEDCOM
  const tree = parseGedcom(gedcomBuffer);
  const selection = selectGedcom(tree);

  // Transform data
  const { individuals, families } = transformGedcomToFamilyTree(selection);

  // Create nodes for individuals
  individuals.forEach((individual) => {
    createNode({
      ...individual,
      id: createNodeId(`Chicken-${individual.id}`),
      parent: null,
      children: [],
      internal: {
        type: 'Chicken',
        contentDigest: createContentDigest(individual),
      },
    });
  });

  // Create nodes for families
  families.forEach((family) => {
    createNode({
      ...family,
      id: createNodeId(`ChickenFamily-${family.id}`),
      parent: null,
      children: [],
      internal: {
        type: 'ChickenFamily',
        contentDigest: createContentDigest(family),
      },
    });
  });
};
