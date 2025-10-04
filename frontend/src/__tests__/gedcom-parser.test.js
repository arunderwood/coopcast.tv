/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { readGedcom } = require('read-gedcom');
const { validateGedcom } = require('../utils/gedcom-validator');

describe('GEDCOM Parser - Sample File Tests', () => {
  let gedcomData;

  beforeAll(() => {
    // Read the sample GEDCOM file (must be read as buffer)
    const gedcomPath = path.join(__dirname, 'fixtures/sample.ged');
    const gedcomBuffer = fs.readFileSync(gedcomPath);
    gedcomData = readGedcom(gedcomBuffer);
  });

  test('should successfully parse GEDCOM file', () => {
    expect(gedcomData).toBeDefined();
    expect(gedcomData).not.toBeNull();
  });

  test('should have getIndividualRecord method', () => {
    expect(typeof gedcomData.getIndividualRecord).toBe('function');
  });

  test('should have getFamilyRecord method', () => {
    expect(typeof gedcomData.getFamilyRecord).toBe('function');
  });

  test('should extract individuals from GEDCOM', () => {
    const individuals = gedcomData.getIndividualRecord();
    expect(individuals).toBeDefined();

    // Convert to array if it's an iterator
    const individualArray = Array.isArray(individuals) ? individuals : Array.from(individuals);
    expect(individualArray.length).toBeGreaterThan(0);
    // Sample file has exactly 4 individuals
    expect(individualArray.length).toBe(4);
  });

  test('should extract families from GEDCOM', () => {
    const families = gedcomData.getFamilyRecord();
    expect(families).toBeDefined();

    // Convert to array if it's an iterator
    const familyArray = Array.isArray(families) ? families : Array.from(families);
    expect(familyArray.length).toBeGreaterThan(0);
    // Sample file has exactly 1 family
    expect(familyArray.length).toBe(1);
  });

  test('individuals should have pointer property', () => {
    const individuals = gedcomData.getIndividualRecord();
    const individualArray = Array.isArray(individuals) ? individuals : Array.from(individuals);
    const firstIndividual = individualArray[0];

    expect(firstIndividual.pointer).toBeDefined();
    expect(typeof firstIndividual.pointer).toBe('string');
    // GEDCOM IDs are wrapped in @
    expect(firstIndividual.pointer).toMatch(/^@.+@$/);
  });

  test('families should have pointer property', () => {
    const families = gedcomData.getFamilyRecord();
    const familyArray = Array.isArray(families) ? families : Array.from(families);
    const firstFamily = familyArray[0];

    expect(firstFamily.pointer).toBeDefined();
    expect(typeof firstFamily.pointer).toBe('string');
    // GEDCOM IDs are wrapped in @
    expect(firstFamily.pointer).toMatch(/^@.+@$/);
  });

  test('should parse individual with breed information', () => {
    const individuals = gedcomData.getIndividualRecord();
    const individualArray = Array.isArray(individuals) ? individuals : Array.from(individuals);

    // Henrietta has _BREED tag
    const henrietta = individualArray.find(i => i.pointer === '@I1@');
    expect(henrietta).toBeDefined();
    expect(henrietta.children).toBeDefined();

    const breedTag = henrietta.children.find(c => c.tag === '_BREED');
    expect(breedTag).toBeDefined();
    expect(breedTag.value).toBe('Rhode Island Red');
  });

  test('should parse deceased individual correctly', () => {
    const individuals = gedcomData.getIndividualRecord();
    const individualArray = Array.isArray(individuals) ? individuals : Array.from(individuals);

    // Nugget is deceased
    const nugget = individualArray.find(i => i.pointer === '@I4@');
    expect(nugget).toBeDefined();
    expect(nugget.children).toBeDefined();

    const deathTag = nugget.children.find(c => c.tag === 'DEAT');
    expect(deathTag).toBeDefined();
  });
});

describe('GEDCOM Parser - Real chickens.ged Validation', () => {
  let realGedcomData;
  let individuals;
  let families;

  beforeAll(() => {
    // Read the real chickens.ged file
    const gedcomPath = path.join(__dirname, '../../data/chickens.ged');
    const gedcomBuffer = fs.readFileSync(gedcomPath);
    realGedcomData = readGedcom(gedcomBuffer);

    const individualRecords = realGedcomData.getIndividualRecord();
    const familyRecords = realGedcomData.getFamilyRecord();
    individuals = Array.isArray(individualRecords) ? individualRecords : Array.from(individualRecords);
    families = Array.isArray(familyRecords) ? familyRecords : Array.from(familyRecords);
  });

  test('should successfully parse real chickens.ged file', () => {
    expect(realGedcomData).toBeDefined();
    expect(realGedcomData).not.toBeNull();
  });

  test('real file should have at least one individual', () => {
    expect(individuals.length).toBeGreaterThan(0);
  });

  test('real file should have at least one family', () => {
    expect(families.length).toBeGreaterThan(0);
  });

  test('all individuals in real file should have valid pointers', () => {
    individuals.forEach(individual => {
      expect(individual.pointer).toBeDefined();
      expect(individual.pointer).toMatch(/^@I\d+@$/);
    });
  });

  test('all families in real file should have valid pointers', () => {
    families.forEach(family => {
      expect(family.pointer).toBeDefined();
      expect(family.pointer).toMatch(/^@F\d+@$/);
    });
  });

  test('real file should have valid cross-references using shared validator', () => {
    // Use the shared validation module
    const result = validateGedcom(individuals, families);

    // Should be valid (no errors)
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);

    // Should have statistics
    expect(result.stats.individuals).toBeGreaterThan(0);
    expect(result.stats.families).toBeGreaterThan(0);
    expect(result.stats.living).toBeGreaterThan(0);
  });
});
