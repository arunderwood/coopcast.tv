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

  test('component displays birth date in American format', () => {
    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    // "1 JAN 2020" should be formatted as "1/1/2020"
    expect(container.textContent).toContain('1/1/2020');
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

describe('FamilyTree Date Formatting', () => {
  test('formats full dates to American format (MM/DD/YYYY)', () => {
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Test',
      gender: 'F',
      birthDate: '3 MAY 2023',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    expect(container.textContent).toContain('5/3/2023');
  });

  test('formats month-year dates (MM/YYYY)', () => {
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Test',
      gender: 'F',
      birthDate: 'SEP 2024',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    expect(container.textContent).toContain('9/2024');
  });

  test('formats year-only dates unchanged', () => {
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Test',
      gender: 'F',
      birthDate: '2024',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: [],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    expect(container.textContent).toContain('2024');
  });

  test('formats death dates in American format', () => {
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Test',
      gender: 'F',
      birthDate: '1 JAN 2020',
      deathDate: '15 DEC 2024',
      isDeceased: true,
      breed: null,
      notes: [],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    expect(container.textContent).toContain('12/15/2024');
  });
});

describe('FamilyTree Generation Cohorts', () => {
  test('groups chickens born within 30 days into same generation', () => {
    const mockChickens = [
      {
        id: 'I1',
        gedcomId: '@I1@',
        fullName: 'Chicken1',
        gender: 'F',
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
        fullName: 'Chicken2',
        gender: 'F',
        birthDate: '10 MAY 2023', // 7 days later - same generation
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: null,
        spouseFamilyIds: [],
      },
    ];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    const nodes = container.querySelectorAll('.family-node-content');
    expect(nodes.length).toBe(2);

    // Both should have same generation color (purple for generation 0)
    const firstBorderColor = nodes[0].style.borderColor;
    const secondBorderColor = nodes[1].style.borderColor;
    expect(firstBorderColor).toBe(secondBorderColor);
  });

  test('separates chickens born more than 30 days apart into different generations', () => {
    const mockChickens = [
      {
        id: 'I1',
        gedcomId: '@I1@',
        fullName: 'Chicken1',
        gender: 'F',
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
        fullName: 'Chicken2',
        gender: 'F',
        birthDate: '10 JUN 2023', // 38 days later - different generation
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: null,
        spouseFamilyIds: [],
      },
    ];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );
    const nodes = container.querySelectorAll('.family-node-content');
    expect(nodes.length).toBe(2);

    // Should have different generation colors
    const firstBorderColor = nodes[0].style.borderColor;
    const secondBorderColor = nodes[1].style.borderColor;
    expect(firstBorderColor).not.toBe(secondBorderColor);
  });
});

describe('FamilyTree Generation Colors', () => {
  test('cycles through all 5 generation colors', () => {
    // Create 6 generations to test cycling
    const mockChickens = [
      {
        id: 'I0',
        gedcomId: '@I0@',
        fullName: 'Gen0',
        gender: 'M',
        birthDate: '1 JAN 2020',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: null,
        spouseFamilyIds: ['@F1@'],
      },
      {
        id: 'I1',
        gedcomId: '@I1@',
        fullName: 'Gen1',
        gender: 'F',
        birthDate: '1 JAN 2021',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: '@F1@',
        spouseFamilyIds: ['@F2@'],
      },
      {
        id: 'I2',
        gedcomId: '@I2@',
        fullName: 'Gen2',
        gender: 'F',
        birthDate: '1 JAN 2022',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: '@F2@',
        spouseFamilyIds: ['@F3@'],
      },
      {
        id: 'I3',
        gedcomId: '@I3@',
        fullName: 'Gen3',
        gender: 'F',
        birthDate: '1 JAN 2023',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: '@F3@',
        spouseFamilyIds: ['@F4@'],
      },
      {
        id: 'I4',
        gedcomId: '@I4@',
        fullName: 'Gen4',
        gender: 'F',
        birthDate: '1 JAN 2024',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: '@F4@',
        spouseFamilyIds: ['@F5@'],
      },
      {
        id: 'I5',
        gedcomId: '@I5@',
        fullName: 'Gen5',
        gender: 'F',
        birthDate: '1 JAN 2025',
        deathDate: null,
        isDeceased: false,
        breed: null,
        notes: [],
        parentFamilyId: '@F5@',
        spouseFamilyIds: [],
      },
    ];

    const mockFamilies = [
      { id: 'F1', gedcomId: '@F1@', husband: '@I0@', wife: null, childrenIds: ['@I1@'] },
      { id: 'F2', gedcomId: '@F2@', husband: null, wife: '@I1@', childrenIds: ['@I2@'] },
      { id: 'F3', gedcomId: '@F3@', husband: null, wife: '@I2@', childrenIds: ['@I3@'] },
      { id: 'F4', gedcomId: '@F4@', husband: null, wife: '@I3@', childrenIds: ['@I4@'] },
      { id: 'F5', gedcomId: '@F5@', husband: null, wife: '@I4@', childrenIds: ['@I5@'] },
    ];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={mockFamilies} />
    );
    const nodes = container.querySelectorAll('.family-node-content');
    expect(nodes.length).toBe(6);

    // Generation 5 should cycle back to same color as generation 0
    const gen0Color = nodes[0].style.borderColor;
    const gen5Color = nodes[5].style.borderColor;
    expect(gen0Color).toBe(gen5Color);
  });
});

describe('FamilyTree Notes Display', () => {
  test('displays full notes without truncation', () => {
    const longNote = 'Had fancy feathered legs. Adopted around 7 months old. Passed away from sickness.';
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Lemon',
      gender: 'F',
      birthDate: '2024',
      deathDate: '2024',
      isDeceased: true,
      breed: 'Blue Cochin',
      notes: [longNote],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );

    // Full note should be visible (not truncated)
    expect(container.textContent).toContain(longNote);
  });

  test('displays multiple notes joined with semicolons', () => {
    const mockChickens = [{
      id: 'I1',
      gedcomId: '@I1@',
      fullName: 'Test',
      gender: 'F',
      birthDate: '2024',
      deathDate: null,
      isDeceased: false,
      breed: null,
      notes: ['First note', 'Second note', 'Third note'],
      parentFamilyId: null,
      spouseFamilyIds: [],
    }];

    const { container } = render(
      <FamilyTree chickens={mockChickens} families={[]} />
    );

    expect(container.textContent).toContain('First note; Second note; Third note');
  });
});
