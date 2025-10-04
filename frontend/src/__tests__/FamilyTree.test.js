import React from 'react';
import { render, screen } from '@testing-library/react';
import FamilyTree from '../components/FamilyTree';

// Mock d3-shape
jest.mock('d3-shape', () => ({
  linkVertical: jest.fn(() => {
    const link = jest.fn((data) => {
      // Return a simple SVG path string
      return `M ${data.source.x} ${data.source.y} L ${data.target.x} ${data.target.y}`;
    });
    link.x = jest.fn(() => link);
    link.y = jest.fn(() => link);
    return link;
  }),
}));

describe('FamilyTree Component', () => {
  const mockChickens = [
    {
      id: 'I1',
      gedcomId: '@I1@',
      givenName: 'Henrietta',
      surname: 'Featherbottom',
      fullName: 'Henrietta Featherbottom',
      gender: 'F',
      birthDate: '15 MAR 2020',
      deathDate: null,
      isDeceased: false,
      breed: 'Rhode Island Red',
      notes: ['Matriarch of the flock.'],
      parentFamilyId: null,
      spouseFamilyIds: ['@F1@'],
    },
    {
      id: 'I2',
      gedcomId: '@I2@',
      givenName: 'Rooster',
      surname: 'McFeathers',
      fullName: 'Rooster McFeathers',
      gender: 'M',
      birthDate: '1 JAN 2020',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: ['The original rooster.'],
      parentFamilyId: null,
      spouseFamilyIds: ['@F1@'],
    },
    {
      id: 'I3',
      gedcomId: '@I3@',
      givenName: 'Penny',
      surname: 'Pecks',
      fullName: 'Penny Pecks',
      gender: 'F',
      birthDate: '10 JUN 2021',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: ['Very social and friendly.'],
      parentFamilyId: '@F1@',
      spouseFamilyIds: [],
    },
  ];

  const mockFamilies = [
    {
      id: 'F1',
      gedcomId: '@F1@',
      husband: '@I2@',
      wife: '@I1@',
      childrenIds: ['@I3@'],
    },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container).toBeInTheDocument();
  });

  test('renders wrapper with correct class', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    const treeWrapper = container.querySelector('.family-tree-wrapper');
    expect(treeWrapper).toBeInTheDocument();
  });

  test('renders SVG element', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    const svg = container.querySelector('.family-tree-svg');
    expect(svg).toBeInTheDocument();
  });

  test('renders all chickens', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    const nodes = container.querySelectorAll('.family-node');
    expect(nodes.length).toBe(mockChickens.length);
  });

  test('displays chicken names', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );

    expect(container.textContent).toContain('Henrietta Featherbottom');
    expect(container.textContent).toContain('Rooster McFeathers');
    expect(container.textContent).toContain('Penny Pecks');
  });

  test('handles empty chickens array gracefully', () => {
    const { container } = render(
      <FamilyTree chickens={[]} families={mockFamilies} />
    );
    expect(container).toBeInTheDocument();
    const errorMessage = screen.getByText(/No chicken data available/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles empty families array gracefully', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    expect(container).toBeInTheDocument();
    // Should still render chickens even without families
    const nodes = container.querySelectorAll('.family-node');
    expect(nodes.length).toBe(mockChickens.length);
  });

  test('handles null chickens prop', () => {
    const { container } = render(
      <FamilyTree chickens={null} families={mockFamilies} />
    );
    expect(container).toBeInTheDocument();
    const errorMessage = screen.getByText(/No chicken data available/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles null families prop', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={null} />
    );
    expect(container).toBeInTheDocument();
    // Should still render chickens even without families
    const nodes = container.querySelectorAll('.family-node');
    expect(nodes.length).toBe(mockChickens.length);
  });
});

describe('FamilyTree Data Display', () => {
  const mockChickens = [
    {
      id: 'I1',
      gedcomId: '@I1@',
      givenName: 'Test',
      surname: 'Chicken',
      fullName: 'Test Chicken',
      gender: 'F',
      birthDate: '1 JAN 2020',
      deathDate: '1 JAN 2024',
      isDeceased: true,
      breed: 'Leghorn',
      notes: ['Test note'],
      parentFamilyId: null,
      spouseFamilyIds: [],
    },
  ];

  const mockFamilies = [];

  test('component handles deceased chickens', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container).toBeInTheDocument();
    const deceasedNode = container.querySelector('.family-node-content.deceased');
    expect(deceasedNode).toBeInTheDocument();
  });

  test('component displays breed information', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container.textContent).toContain('Leghorn');
  });

  test('component displays birth date', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container.textContent).toContain('1 JAN 2020');
  });

  test('component handles chickens with notes', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container.textContent).toContain('Test note');
  });

  test('component displays gender emoji for female', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    expect(container.textContent).toContain('🐔');
  });
});

describe('FamilyTree Chronological Layout', () => {
  const mockChickensMultipleCohorts = [
    {
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Whitey',
      gender: 'M',
      birthDate: '3 MAY 2023',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: null,
      spouseFamilyIds: [],
    },
    {
      id: 'I2',
      gedcomId: '@I2@',
      fullName: 'Larry',
      gender: 'F',
      birthDate: 'SEP 2024',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: '@F1@',
      spouseFamilyIds: [],
    },
    {
      id: 'I3',
      gedcomId: '@I3@',
      fullName: 'Banana',
      gender: 'F',
      birthDate: '11 MAY 2025',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: '@F2@',
      spouseFamilyIds: [],
    },
  ];

  const mockFamilies = [
    {
      id: 'F1',
      gedcomId: '@F1@',
      husband: '@I1@',
      wife: null,
      childrenIds: ['@I2@'],
    },
    {
      id: 'F2',
      gedcomId: '@F2@',
      husband: '@I1@',
      wife: null,
      childrenIds: ['@I3@'],
    },
  ];

  test('renders all chickens regardless of birth cohort', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickensMultipleCohorts} families={mockFamilies} />
    );
    const nodes = container.querySelectorAll('.family-node');
    expect(nodes.length).toBe(mockChickensMultipleCohorts.length);
  });

  test('renders connection lines for parent-child relationships', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickensMultipleCohorts} families={mockFamilies} />
    );
    const connections = container.querySelectorAll('.connection-parent-child');
    expect(connections.length).toBeGreaterThan(0);
  });
});
