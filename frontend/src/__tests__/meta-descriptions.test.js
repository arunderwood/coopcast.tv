/**
 * Tests for SEO meta descriptions in page Head exports
 *
 * React 19 automatically hoists <meta>, <title>, and <link> elements
 * to document.head during client-side rendering, so we query
 * document.head directly after rendering.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Head as IndexHead } from '../pages/index';
import { Head as FamilyTreeHead } from '../pages/family-tree';

// Mock Gatsby modules - must be after imports but before tests
jest.mock('gatsby', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  graphql: jest.fn(),
  useStaticQuery: jest.fn(),
}));

/**
 * Render a Gatsby Head component and return a query helper
 * that searches document.head (where React 19 hoists metadata elements).
 */
function renderHead(Component) {
  const result = render(<Component />);
  return {
    ...result,
    queryMeta: (selector) => document.head.querySelector(selector),
  };
}

afterEach(() => {
  // Clean up metadata elements React 19 hoisted to document.head
  document.head.querySelectorAll('meta[name="description"], title, link[rel="icon"]').forEach(el => el.remove());
});

describe('Meta Descriptions', () => {
  describe('Homepage (index.js)', () => {
    it('should have a meta description', () => {
      const { queryMeta } = renderHead(IndexHead);
      const metaDescription = queryMeta('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const { queryMeta } = renderHead(IndexHead);
      const metaDescription = queryMeta('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.length).toBeGreaterThanOrEqual(50);
      expect(content.length).toBeLessThanOrEqual(160);
    });

    it('should describe the chicken coop live stream', () => {
      const { queryMeta } = renderHead(IndexHead);
      const metaDescription = queryMeta('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.toLowerCase()).toMatch(/chicken|coop|stream|live/);
    });

    it('should have expected meta description content', () => {
      const { queryMeta } = renderHead(IndexHead);
      const metaDescription = queryMeta('meta[name="description"]');

      expect(metaDescription?.getAttribute('content')).toBe(
        "Watch our live chicken coop stream 24/7. Meet our flock and explore their family tree."
      );
    });
  });

  describe('Family Tree Page (family-tree.js)', () => {
    it('should have a meta description', () => {
      const { queryMeta } = renderHead(FamilyTreeHead);
      const metaDescription = queryMeta('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const { queryMeta } = renderHead(FamilyTreeHead);
      const metaDescription = queryMeta('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.length).toBeGreaterThanOrEqual(50);
      expect(content.length).toBeLessThanOrEqual(160);
    });

    it('should describe the genealogy and family tree', () => {
      const { queryMeta } = renderHead(FamilyTreeHead);
      const metaDescription = queryMeta('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.toLowerCase()).toMatch(/genealogy|family tree|chicken/);
    });

    it('should have expected meta description content', () => {
      const { queryMeta } = renderHead(FamilyTreeHead);
      const metaDescription = queryMeta('meta[name="description"]');

      expect(metaDescription?.getAttribute('content')).toBe(
        "Explore the genealogy of CoopCast chickens through an interactive family tree showing generations, breeds, and relationships."
      );
    });
  });

  describe('Lighthouse CI Compatibility', () => {
    it('homepage meta description should pass Lighthouse meta-description audit', () => {
      const { queryMeta } = renderHead(IndexHead);
      const metaDescription = queryMeta('meta[name="description"]');

      // Lighthouse requires:
      // 1. Meta description exists
      // 2. Has content attribute
      // 3. Content is not empty
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute('content');
      expect(metaDescription?.getAttribute('content')).toBeTruthy();
    });

    it('family-tree meta description should pass Lighthouse meta-description audit', () => {
      const { queryMeta } = renderHead(FamilyTreeHead);
      const metaDescription = queryMeta('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute('content');
      expect(metaDescription?.getAttribute('content')).toBeTruthy();
    });
  });
});
