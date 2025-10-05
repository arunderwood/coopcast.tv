/**
 * Tests for SEO meta descriptions in page Head exports
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

jest.mock('gatsby-link', () => ({
  default: ({ to, children }) => <a href={to}>{children}</a>,
}));

describe('Meta Descriptions', () => {
  describe('Homepage (index.js)', () => {
    it('should have a meta description', () => {
      const { container } = render(<IndexHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const { container } = render(<IndexHead />);
      const metaDescription = container.querySelector('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.length).toBeGreaterThanOrEqual(50);
      expect(content.length).toBeLessThanOrEqual(160);
    });

    it('should describe the chicken coop live stream', () => {
      const { container } = render(<IndexHead />);
      const metaDescription = container.querySelector('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.toLowerCase()).toMatch(/chicken|coop|stream|live/);
    });

    it('should have expected meta description content', () => {
      const { container } = render(<IndexHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      expect(metaDescription?.getAttribute('content')).toBe(
        "Watch our live chicken coop stream 24/7. Meet our flock and explore their family tree."
      );
    });
  });

  describe('Family Tree Page (family-tree.js)', () => {
    it('should have a meta description', () => {
      const { container } = render(<FamilyTreeHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const { container } = render(<FamilyTreeHead />);
      const metaDescription = container.querySelector('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.length).toBeGreaterThanOrEqual(50);
      expect(content.length).toBeLessThanOrEqual(160);
    });

    it('should describe the genealogy and family tree', () => {
      const { container } = render(<FamilyTreeHead />);
      const metaDescription = container.querySelector('meta[name="description"]');
      const content = metaDescription?.getAttribute('content') || '';

      expect(content.toLowerCase()).toMatch(/genealogy|family tree|chicken/);
    });

    it('should have expected meta description content', () => {
      const { container } = render(<FamilyTreeHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      expect(metaDescription?.getAttribute('content')).toBe(
        "Explore the genealogy of CoopCast chickens through an interactive family tree showing generations, breeds, and relationships."
      );
    });
  });

  describe('Lighthouse CI Compatibility', () => {
    it('homepage meta description should pass Lighthouse meta-description audit', () => {
      const { container } = render(<IndexHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      // Lighthouse requires:
      // 1. Meta description exists
      // 2. Has content attribute
      // 3. Content is not empty
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute('content');
      expect(metaDescription?.getAttribute('content')).toBeTruthy();
    });

    it('family-tree meta description should pass Lighthouse meta-description audit', () => {
      const { container } = render(<FamilyTreeHead />);
      const metaDescription = container.querySelector('meta[name="description"]');

      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription).toHaveAttribute('content');
      expect(metaDescription?.getAttribute('content')).toBeTruthy();
    });
  });
});
