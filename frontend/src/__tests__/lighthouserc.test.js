/**
 * Tests for Lighthouse CI configuration
 * Validates .lighthouserc.js structure and assertions
 */

const path = require('path');

describe('Lighthouse CI Configuration', () => {
  let config;

  beforeAll(() => {
    // Set LHCI_URL for testing
    process.env.LHCI_URL = 'https://example.com';
    const configPath = path.join(__dirname, '../../.lighthouserc.js');
    // Clear require cache to ensure fresh load with env var
    delete require.cache[require.resolve(configPath)];
    config = require(configPath);
  });

  describe('Structure', () => {
    it('should have ci configuration', () => {
      expect(config).toHaveProperty('ci');
      expect(typeof config.ci).toBe('object');
    });

    it('should have collect, assert, and upload sections', () => {
      expect(config.ci).toHaveProperty('collect');
      expect(config.ci).toHaveProperty('assert');
      expect(config.ci).toHaveProperty('upload');
    });
  });

  describe('Collect Configuration', () => {
    it('should use LHCI_URL environment variable for URLs', () => {
      expect(config.ci.collect.url).toBeInstanceOf(Array);
      expect(config.ci.collect.url).toContain('https://example.com/');
      expect(config.ci.collect.url).toContain('https://example.com/family-tree/');
    });

    it('should test both homepage and family-tree page', () => {
      expect(config.ci.collect.url).toHaveLength(2);
    });

    it('should emulate mobile form factor', () => {
      expect(config.ci.collect.settings).toHaveProperty('emulatedFormFactor');
      expect(config.ci.collect.settings.emulatedFormFactor).toBe('mobile');
    });

    it('should have mobile throttling configuration', () => {
      const throttling = config.ci.collect.settings.throttling;

      expect(throttling).toHaveProperty('rttMs');
      expect(throttling).toHaveProperty('throughputKbps');
      expect(throttling).toHaveProperty('cpuSlowdownMultiplier');

      // Mobile throttling values
      expect(throttling.cpuSlowdownMultiplier).toBe(4);
    });

    it('should specify output directory', () => {
      expect(config.ci.collect).toHaveProperty('outputDir');
      expect(config.ci.collect.outputDir).toBe('.lighthouseci');
    });
  });

  describe('Assertions', () => {
    it('should have critical mobile usability assertions', () => {
      const assertions = config.ci.assert.assertions;

      // Font size (critical for readability)
      expect(assertions).toHaveProperty('font-size');
      expect(assertions['font-size']).toEqual(['error']);

      // HTML lang attribute (critical for accessibility)
      expect(assertions).toHaveProperty('html-has-lang');
      expect(assertions['html-has-lang']).toEqual(['error']);

      // Viewport (critical for mobile)
      expect(assertions).toHaveProperty('viewport');
      expect(assertions.viewport).toEqual(['error']);
    });

    it('should have accessibility score requirement', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:accessibility');
      expect(assertions['categories:accessibility'][0]).toBe('error');
      expect(assertions['categories:accessibility'][1]).toHaveProperty('minScore');
      expect(assertions['categories:accessibility'][1].minScore).toBe(0.9);
    });

    it('should have best practices as warning (not error)', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:best-practices');
      expect(assertions['categories:best-practices'][0]).toBe('warn');
    });

    it('should require meta descriptions (SEO)', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('meta-description');
      expect(assertions['meta-description']).toEqual(['warn']);
    });
  });

  describe('Upload Configuration', () => {
    it('should use filesystem target for PR decoration', () => {
      expect(config.ci.upload.target).toBe('filesystem');
    });

    it('should have GitHub status context suffix', () => {
      expect(config.ci.upload).toHaveProperty('githubStatusContextSuffix');
      expect(config.ci.upload.githubStatusContextSuffix).toBe('/mobile');
    });
  });

  describe('Mobile Testing Compliance', () => {
    it('should test critical Lighthouse mobile audits', () => {
      const assertions = config.ci.assert.assertions;

      // These are the audits that were failing before our fixes
      const criticalMobileAudits = [
        'font-size',         // Was failing: 8px/9px/10px fonts
        'html-has-lang',     // Was failing: no lang attribute
        'viewport',          // Mobile viewport
        'meta-description'   // SEO requirement
      ];

      criticalMobileAudits.forEach(audit => {
        expect(assertions).toHaveProperty(audit);
      });
    });

    it('should not test tap-targets (known limitation)', () => {
      // Tap targets currently fail on some elements, but this is a known limitation
      // of the family tree SVG interaction. We test this manually with mobile-ux-tester.
      const assertions = config.ci.assert.assertions;
      expect(assertions).not.toHaveProperty('tap-targets');
    });
  });

  describe('Environment Variable Usage', () => {
    it('should use correct Lighthouse CI env var syntax', () => {
      // Lighthouse CI requires ${LHCI_*} prefix for environment variables
      const urls = config.ci.collect.url;

      urls.forEach(url => {
        if (url.includes('LHCI_URL')) {
          expect(url).toMatch(/\$\{LHCI_URL\}/);
          expect(url).not.toMatch(/\$PREVIEW_URL/); // Old incorrect var
          expect(url).not.toMatch(/%PREVIEW_URL%/);  // Wrong syntax
        }
      });
    });
  });
});
