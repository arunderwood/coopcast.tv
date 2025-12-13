/**
 * Tests for SEO meta descriptions in page Head exports
 *
 * Note: These tests check the Head component's children directly rather than
 * rendering to DOM, as Gatsby Head components are processed specially by Gatsby's
 * build system and don't render meta tags to the regular DOM in test environment.
 */

import React from 'react';
import { Head as IndexHead } from '../pages/index';
import { Head as FamilyTreeHead } from '../pages/family-tree';

// Mock Gatsby modules
jest.mock('gatsby', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  graphql: jest.fn(),
  useStaticQuery: jest.fn(),
}));

jest.mock('gatsby-link', () => ({
  default: ({ to, children }) => <a href={to}>{children}</a>,
}));

// Helper to extract meta description from Head component's children
const getMetaDescription = (HeadComponent) => {
  // Call the Head function to get the React element
  const headElement = HeadComponent();

  // The Head component returns a fragment, so we need to access its children
  const children = headElement.props?.children || [];
  const childArray = React.Children.toArray(children);

  const metaTag = childArray.find(
    child => child.type === 'meta' && child.props?.name === 'description'
  );

  return metaTag?.props?.content;
};

describe('Meta Descriptions', () => {
  describe('Homepage (index.js)', () => {
    it('should have a meta description', () => {
      const description = getMetaDescription(IndexHead);
      expect(description).toBeTruthy();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const description = getMetaDescription(IndexHead);

      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(160);
    });

    it('should describe the chicken coop live stream', () => {
      const description = getMetaDescription(IndexHead);

      expect(description.toLowerCase()).toMatch(/chicken|coop|stream|live/);
    });

    it('should have expected meta description content', () => {
      const description = getMetaDescription(IndexHead);

      expect(description).toBe(
        "Watch our live chicken coop stream 24/7. Meet our flock and explore their family tree."
      );
    });
  });

  describe('Family Tree Page (family-tree.js)', () => {
    it('should have a meta description', () => {
      const description = getMetaDescription(FamilyTreeHead);
      expect(description).toBeTruthy();
    });

    it('should have description between 50-160 characters (SEO best practice)', () => {
      const description = getMetaDescription(FamilyTreeHead);

      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(160);
    });

    it('should describe the genealogy and family tree', () => {
      const description = getMetaDescription(FamilyTreeHead);

      expect(description.toLowerCase()).toMatch(/genealogy|family tree|chicken/);
    });

    it('should have expected meta description content', () => {
      const description = getMetaDescription(FamilyTreeHead);

      expect(description).toBe(
        "Explore the genealogy of CoopCast chickens through an interactive family tree showing generations, breeds, and relationships."
      );
    });
  });

  describe('Lighthouse CI Compatibility', () => {
    it('homepage meta description should pass Lighthouse meta-description audit', () => {
      const description = getMetaDescription(IndexHead);

      // Lighthouse requires:
      // 1. Meta description exists
      // 2. Has content attribute
      // 3. Content is not empty
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });

    it('family-tree meta description should pass Lighthouse meta-description audit', () => {
      const description = getMetaDescription(FamilyTreeHead);

      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });
  });
});
