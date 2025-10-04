import React, { useMemo, useState, useEffect } from 'react';
import { linkVertical } from 'd3-shape';
import './FamilyTree.css';

/**
 * Parse date string to comparable format
 * Handles formats: "3 MAY 2023", "SEP 2024", "2024", "10 MAY 2025"
 */
function parseChickenDate(dateStr) {
  if (!dateStr) return null;

  const monthMap = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };

  const parts = dateStr.trim().split(' ');

  if (parts.length === 3) {
    // "3 MAY 2023" or "10 MAY 2025"
    const day = parts[0].padStart(2, '0');
    const month = monthMap[parts[1]] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  } else if (parts.length === 2) {
    // "SEP 2024"
    const month = monthMap[parts[0]] || '01';
    const year = parts[1];
    return `${year}-${month}-01`;
  } else if (parts.length === 1) {
    // "2024"
    return `${parts[0]}-01-01`;
  }

  return dateStr;
}

/**
 * Group chickens by birth cohort for chronological display
 */
function groupByBirthCohort(chickens) {
  const sorted = [...chickens].sort((a, b) => {
    const dateA = parseChickenDate(a.birthDate) || '9999';
    const dateB = parseChickenDate(b.birthDate) || '9999';
    return dateA.localeCompare(dateB);
  });

  const cohorts = [];
  let currentCohort = null;

  sorted.forEach(chicken => {
    const parsedDate = parseChickenDate(chicken.birthDate);

    if (!currentCohort || currentCohort.dateKey !== parsedDate) {
      currentCohort = {
        dateKey: parsedDate,
        displayDate: chicken.birthDate || 'Unknown',
        chickens: []
      };
      cohorts.push(currentCohort);
    }

    currentCohort.chickens.push(chicken);
  });

  return cohorts;
}

/**
 * Color palette for different families/broods
 */
const FAMILY_COLORS = {
  'F1': { start: '#7C3AED', end: '#9333EA', name: 'purple' },      // Purple for F1
  'F2': { start: '#06B6D4', end: '#0891B2', name: 'cyan' },        // Cyan for F2
  'F3': { start: '#F59E0B', end: '#D97706', name: 'amber' },       // Amber for F3
  'F4': { start: '#10B981', end: '#059669', name: 'emerald' },     // Emerald for F4
  'F5': { start: '#EC4899', end: '#DB2777', name: 'pink' },        // Pink for F5
  'default': { start: '#6366F1', end: '#4F46E5', name: 'indigo' }  // Indigo default
};

/**
 * Color palette for generation-based border colors
 */
const GENERATION_COLORS = {
  0: { living: '#7C3AED', deceased: '#B4A3D9' },  // Purple - Founders
  1: { living: '#06B6D4', deceased: '#8DD5E3' },  // Cyan - First generation
  2: { living: '#F59E0B', deceased: '#F9C574' },  // Amber - Second generation
  3: { living: '#10B981', deceased: '#7DD4B4' },  // Emerald - Third generation
  4: { living: '#EC4899', deceased: '#F5A3CB' },  // Pink - Fourth generation+
};

/**
 * Build relationship map from families data with family IDs
 */
function buildRelationshipMap(families, chickens) {
  const relationships = {
    spouses: new Map(), // Map of chicken ID -> spouse IDs
    parents: new Map(), // Map of chicken ID -> parent IDs
    children: new Map(), // Map of chicken ID -> child IDs
    familyColors: new Map() // Map of family key -> GEDCOM family ID
  };

  // Create chicken lookup by GEDCOM ID
  const chickenByGedcomId = new Map();
  chickens.forEach(chicken => {
    chickenByGedcomId.set(chicken.gedcomId, chicken);
  });

  families.forEach(family => {
    const husbandId = family.husband ? chickenByGedcomId.get(family.husband)?.id : null;
    const wifeId = family.wife ? chickenByGedcomId.get(family.wife)?.id : null;

    // Record spouse relationships
    if (husbandId && wifeId) {
      if (!relationships.spouses.has(husbandId)) {
        relationships.spouses.set(husbandId, []);
      }
      if (!relationships.spouses.has(wifeId)) {
        relationships.spouses.set(wifeId, []);
      }
      relationships.spouses.get(husbandId).push(wifeId);
      relationships.spouses.get(wifeId).push(husbandId);
    }

    // Record parent-child relationships
    if (family.childrenIds) {
      family.childrenIds.forEach(childGedcomId => {
        const childId = chickenByGedcomId.get(childGedcomId)?.id;
        if (childId) {
          // Add parents to child
          if (!relationships.parents.has(childId)) {
            relationships.parents.set(childId, []);
          }
          if (husbandId) relationships.parents.get(childId).push(husbandId);
          if (wifeId) relationships.parents.get(childId).push(wifeId);

          // Add children to parents
          if (husbandId) {
            if (!relationships.children.has(husbandId)) {
              relationships.children.set(husbandId, []);
            }
            relationships.children.get(husbandId).push(childId);
          }
          if (wifeId) {
            if (!relationships.children.has(wifeId)) {
              relationships.children.set(wifeId, []);
            }
            relationships.children.get(wifeId).push(childId);
          }

          // Store family color mapping
          const familyKey = husbandId && wifeId && husbandId < wifeId
            ? `${husbandId}-${wifeId}`
            : husbandId && wifeId
            ? `${wifeId}-${husbandId}`
            : husbandId || wifeId;

          if (familyKey) {
            relationships.familyColors.set(familyKey, family.gedcomId);
          }
        }
      });
    }
  });

  // Calculate generation levels using birth year cohorts and family relationships
  const generations = new Map();
  const queue = [];

  // Group chickens without parents by birth year
  const foundersByYear = new Map();
  chickens.forEach(chicken => {
    if (!relationships.parents.has(chicken.id) || relationships.parents.get(chicken.id).length === 0) {
      // Extract year from birth date
      const birthYear = chicken.birthDate ? parseInt(chicken.birthDate.match(/\d{4}/)?.[0] || '0') : 0;
      if (!foundersByYear.has(birthYear)) {
        foundersByYear.set(birthYear, []);
      }
      foundersByYear.get(birthYear).push(chicken.id);
    }
  });

  // Assign generation 0 to earliest birth year, then increment for each subsequent year
  const sortedYears = Array.from(foundersByYear.keys()).sort((a, b) => a - b);
  sortedYears.forEach((year, index) => {
    foundersByYear.get(year).forEach(chickenId => {
      generations.set(chickenId, index);
      queue.push({ id: chickenId, generation: index });
    });
  });

  // BFS to assign generation levels to descendants
  while (queue.length > 0) {
    const { id: parentId, generation: parentGeneration } = queue.shift();

    if (relationships.children.has(parentId)) {
      relationships.children.get(parentId).forEach(childId => {
        if (!generations.has(childId)) {
          const childGeneration = parentGeneration + 1;
          generations.set(childId, childGeneration);
          queue.push({ id: childId, generation: childGeneration });
        }
      });
    }
  }

  relationships.generations = generations;

  return relationships;
}

/**
 * Calculate positions for all chickens with smart family grouping
 */
function calculateChickenPositions(cohorts, nodeWidth, nodeHeight, relationships) {
  const positions = new Map();
  const horizontalSpacing = nodeWidth + 60; // Increased spacing
  const verticalSpacing = nodeHeight + 100; // Increased vertical spacing

  let currentY = 40;

  cohorts.forEach((cohort, cohortIndex) => {
    // Identify spouse pairs and families in this cohort
    const processed = new Set();
    const rows = [];
    let currentRow = [];

    cohort.chickens.forEach(chicken => {
      if (processed.has(chicken.id)) return;

      // Check if this chicken has a spouse in the same cohort
      const spouses = relationships?.spouses?.get(chicken.id) || [];
      const spouseInCohort = spouses.find(spouseId => {
        const spouse = cohort.chickens.find(c => c.id === spouseId);
        return spouse && !processed.has(spouseId);
      });

      if (spouseInCohort) {
        // Add both spouses as a pair
        currentRow.push({ type: 'couple', chickens: [chicken, cohort.chickens.find(c => c.id === spouseInCohort)] });
        processed.add(chicken.id);
        processed.add(spouseInCohort);
      } else {
        // Add as single chicken
        currentRow.push({ type: 'single', chickens: [chicken] });
        processed.add(chicken.id);
      }
    });

    rows.push(currentRow);

    // Calculate positions for this cohort
    rows.forEach(row => {
      const totalUnits = row.reduce((sum, item) => {
        return sum + (item.type === 'couple' ? 2 : 1);
      }, 0);

      const totalWidth = (totalUnits * horizontalSpacing) - (horizontalSpacing - nodeWidth);
      const startX = Math.max(40, (1200 - totalWidth) / 2); // Wider viewport

      let currentX = startX;

      row.forEach(item => {
        if (item.type === 'couple') {
          // Place spouses adjacent to each other
          const [first, second] = item.chickens;
          positions.set(first.id, {
            x: currentX,
            y: currentY,
            chicken: first,
            cohortIndex,
            hasSpouse: true,
            spouseRight: second.id
          });
          currentX += horizontalSpacing;
          positions.set(second.id, {
            x: currentX,
            y: currentY,
            chicken: second,
            cohortIndex,
            hasSpouse: true,
            spouseLeft: first.id
          });
          currentX += horizontalSpacing;
        } else {
          // Single chicken
          positions.set(item.chickens[0].id, {
            x: currentX,
            y: currentY,
            chicken: item.chickens[0],
            cohortIndex,
            hasSpouse: false
          });
          currentX += horizontalSpacing;
        }
      });

      currentY += verticalSpacing;
    });
  });

  return positions;
}

/**
 * Generate SVG path for connection lines with improved routing
 */
function generateConnectionPath(source, target, type, metadata = {}) {
  if (type === 'spouse') {
    // Horizontal line at bottom of cards, edge to edge
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  } else if (type === 'parent-child') {
    // Smooth S-curve from parent bottom to child top
    const link = linkVertical()
      .x(d => d.x)
      .y(d => d.y);

    return link({
      source: { x: source.x, y: source.y },
      target: { x: target.x, y: target.y }
    });
  } else if (type === 'family-connector') {
    // T-junction: horizontal bar between parents, vertical line to children
    const { parentLeft, parentRight, childrenMidpoint } = metadata;
    return `M ${parentLeft.x} ${parentLeft.y} L ${parentRight.x} ${parentRight.y} M ${childrenMidpoint.x} ${parentLeft.y} L ${childrenMidpoint.x} ${childrenMidpoint.y}`;
  }

  return '';
}

/**
 * FamilyNode component - renders a single chicken card
 */
const FamilyNode = ({ chicken, style, generation }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Get generation-based border color
  const genLevel = generation !== undefined ? Math.min(generation, 4) : 0;
  const borderColor = chicken.isDeceased
    ? GENERATION_COLORS[genLevel].deceased
    : GENERATION_COLORS[genLevel].living;

  // Gender emoji
  let genderEmoji = '🐔'; // Hen
  if (chicken.gender === 'M') genderEmoji = '🐓'; // Rooster
  else if (chicken.gender === 'U') genderEmoji = '🥚'; // Unknown

  // Gender text
  let genderText = 'Hen';
  if (chicken.gender === 'M') genderText = 'Rooster';
  else if (chicken.gender === 'U') genderText = 'Unknown';

  const deceased = chicken.isDeceased ? '🪦' : '';
  const deathInfo = chicken.deathDate ? ` (${chicken.deathDate})` : '';

  // Breed display
  const breedDisplay = chicken.breed ? `🏆 ${chicken.breed}` : '';

  // Notes with truncation
  let notesDisplay = '';
  if (chicken.notes && chicken.notes.length > 0) {
    const notesText = chicken.notes.join('; ');
    const maxNoteLength = isMobile ? 40 : 80;
    const truncatedNotes = notesText.length > maxNoteLength
      ? notesText.substring(0, maxNoteLength) + '...'
      : notesText;
    notesDisplay = `📝 ${truncatedNotes}`;
  }

  return (
    <div className="family-node" style={style}>
      <div
        className={`family-node-content ${chicken.isDeceased ? 'deceased' : ''}`}
        style={{ borderColor }}
      >
        <div className="family-node-name">
          {deceased} {chicken.fullName} {deceased}
        </div>
        <div className="family-node-gender">
          {genderEmoji} {genderText}
        </div>
        {breedDisplay && (
          <div className="family-node-breed">{breedDisplay}</div>
        )}
        {chicken.birthDate && (
          <div className="family-node-detail">
            {isMobile ? '🎂 ' : '🎂 Born: '}{chicken.birthDate}
          </div>
        )}
        {chicken.isDeceased && (
          <div className="family-node-death">
            {deceased} {deathInfo}
          </div>
        )}
        {notesDisplay && (
          <div className="family-node-notes">{notesDisplay}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Get responsive node dimensions
 */
function getResponsiveDimensions() {
  if (typeof window === 'undefined') {
    return { width: 240, height: 120 };
  }

  const width = window.innerWidth;

  if (width < 768) {
    return { width: 180, height: 100 };
  } else if (width < 1024) {
    return { width: 220, height: 110 };
  } else {
    return { width: 240, height: 120 };
  }
}

/**
 * FamilyTree component - chronological timeline visualization
 */
const FamilyTree = ({ chickens, families }) => {
  const [dimensions, setDimensions] = useState({ width: 240, height: 120 });

  // Group chickens by birth cohort
  const cohorts = useMemo(() => {
    if (!chickens) return [];
    return groupByBirthCohort(chickens);
  }, [chickens]);

  // Build relationship maps
  const relationships = useMemo(() => {
    if (!families || !chickens) return null;
    return buildRelationshipMap(families, chickens);
  }, [families, chickens]);

  // Calculate positions
  const positions = useMemo(() => {
    return calculateChickenPositions(cohorts, dimensions.width, dimensions.height, relationships);
  }, [cohorts, dimensions, relationships]);

  // Generate connection lines
  const connections = useMemo(() => {
    if (!relationships || !positions) return [];

    const lines = [];
    const processedFamilies = new Set();

    // Group parent-child connections by family
    const familyConnections = new Map();

    relationships.children.forEach((childIds, parentId) => {
      const parentPos = positions.get(parentId);
      if (!parentPos) {
        return;
      }

      // Find spouse of this parent
      const spouses = relationships.spouses.get(parentId) || [];
      const spouse = spouses.find(spouseId => {
        const spousePos = positions.get(spouseId);
        return spousePos && Math.abs(spousePos.y - parentPos.y) < 10; // Same row
      });

      const familyKey = spouse && parentId < spouse
        ? `${parentId}-${spouse}`
        : spouse && parentId > spouse
        ? `${spouse}-${parentId}`
        : parentId;

      if (!familyConnections.has(familyKey)) {
        familyConnections.set(familyKey, {
          parents: spouse ? [parentId, spouse] : [parentId],
          children: childIds
        });
      }
    });

    // Draw family connections with T-junction pattern
    familyConnections.forEach((family, familyKey) => {
      if (processedFamilies.has(familyKey)) return;
      processedFamilies.add(familyKey);

      const parentPositions = family.parents.map(id => positions.get(id)).filter(Boolean);
      const childPositions = family.children.map(id => positions.get(id)).filter(Boolean);

      if (parentPositions.length === 0 || childPositions.length === 0) return;

      // Get family GEDCOM ID for color
      const familyGedcomId = relationships.familyColors.get(familyKey) || 'default';

      // Calculate connection points
      const parentBottomY = parentPositions[0].y + dimensions.height;

      if (parentPositions.length === 2) {
        // Two parents - draw T-junction
        const leftParent = parentPositions[0].x < parentPositions[1].x ? parentPositions[0] : parentPositions[1];
        const rightParent = parentPositions[0].x < parentPositions[1].x ? parentPositions[1] : parentPositions[0];
        const parentCenterX = (leftParent.x + rightParent.x + dimensions.width) / 2;

        // Horizontal bar between parents
        const barY = parentBottomY + 20;

        // Draw lines from each child to the center point
        childPositions.forEach(childPos => {
          const childTopY = childPos.y;
          const childCenterX = childPos.x + dimensions.width / 2;

          // Vertical line from child to horizontal bar level
          const path = `M ${childCenterX} ${childTopY} L ${childCenterX} ${barY} L ${parentCenterX} ${barY} L ${parentCenterX} ${parentBottomY}`;

          lines.push({
            id: `family-${familyKey}-${childPos.chicken.id}`,
            path,
            type: 'parent-child',
            familyId: familyGedcomId
          });
        });
      } else {
        // Single parent - draw simple lines
        const parentCenterX = parentPositions[0].x + dimensions.width / 2;

        childPositions.forEach(childPos => {
          const childCenterX = childPos.x + dimensions.width / 2;

          lines.push({
            id: `parent-child-${family.parents[0]}-${childPos.chicken.id}`,
            path: generateConnectionPath(
              { x: parentCenterX, y: parentBottomY },
              { x: childCenterX, y: childPos.y },
              'parent-child'
            ),
            type: 'parent-child',
            familyId: familyGedcomId
          });
        });
      }
    });

    return lines;
  }, [relationships, positions, dimensions]);

  // Calculate SVG viewBox
  const viewBox = useMemo(() => {
    if (positions.size === 0) return '0 0 800 600';

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + dimensions.width);
      maxY = Math.max(maxY, pos.y + dimensions.height);
    });

    const padding = 40;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  }, [positions, dimensions]);

  // Handle responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions(getResponsiveDimensions());
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!chickens || chickens.length === 0) {
    return (
      <div className="family-tree-error">
        <p>No chicken data available</p>
      </div>
    );
  }

  return (
    <div className="family-tree-wrapper">
      <svg
        className="family-tree-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Define gradients for each family color */}
        <defs>
          {Object.entries(FAMILY_COLORS).map(([familyId, colors]) => (
            <linearGradient
              key={`gradient-${familyId}`}
              id={`connection-gradient-${familyId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          ))}
        </defs>

        {/* Render connection lines */}
        <g className="connections">
          {connections.map(conn => {
            const gradientId = `connection-gradient-${conn.familyId || 'default'}`;
            return (
              <path
                key={conn.id}
                d={conn.path}
                className={`connection connection-${conn.type} connection-family-${conn.familyId || 'default'}`}
                stroke={`url(#${gradientId})`}
                strokeWidth="3"
                fill="none"
                opacity="0.9"
              />
            );
          })}
        </g>

        {/* Render chicken nodes */}
        <g className="nodes">
          {Array.from(positions.values()).map(pos => (
            <foreignObject
              key={pos.chicken.id}
              x={pos.x}
              y={pos.y}
              width={dimensions.width}
              height={dimensions.height}
            >
              <FamilyNode
                chicken={pos.chicken}
                generation={relationships?.generations?.get(pos.chicken.id)}
                style={{
                  width: dimensions.width,
                  height: dimensions.height
                }}
              />
            </foreignObject>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default FamilyTree;
