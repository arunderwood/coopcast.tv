/**
 * Tests for Lighthouse CI configuration
 * Validates lighthouserc.json structure and assertions
 */

const fs = require('fs');
const path = require('path');

describe('Lighthouse CI Configuration', () => {
  let config;

  beforeAll(() => {
    const configPath = path.join(__dirname, '../../lighthouserc.json');
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
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
      expect(config.ci.collect.url).toHaveLength(2);

      // Check that URLs use LHCI_URL placeholder (avoiding template literal syntax)
      expect(config.ci.collect.url[0]).toMatch(/^\$\{LHCI_URL\}$/);
      expect(config.ci.collect.url[1]).toMatch(/^\$\{LHCI_URL\}\/family-tree$/);
    });

    it('should test both homepage and family-tree page', () => {
      // Verify one URL is for homepage, one is for family-tree
      const hasHomepage = config.ci.collect.url.some(url => url.match(/^\$\{LHCI_URL\}$/));
      const hasFamilyTree = config.ci.collect.url.some(url => url.includes('/family-tree'));

      expect(hasHomepage).toBe(true);
      expect(hasFamilyTree).toBe(true);
    });

    it('should run 3 times for reliable results', () => {
      expect(config.ci.collect.numberOfRuns).toBe(3);
    });

    it('should explicitly configure mobile settings and categories', () => {
      // Workaround for LHCI bug where categories return NaN in CI environments
      // See: https://github.com/GoogleChrome/lighthouse-ci/issues/735
      // See: https://github.com/GoogleChrome/lighthouse-ci/issues/1113
      expect(config.ci.collect.settings).toHaveProperty('formFactor', 'mobile');
      expect(config.ci.collect.settings).toHaveProperty('screenEmulation');
      expect(config.ci.collect.settings.screenEmulation.mobile).toBe(true);
      expect(config.ci.collect.settings).toHaveProperty('onlyCategories');
      expect(config.ci.collect.settings.onlyCategories).toEqual([
        'performance', 'accessibility', 'best-practices', 'seo'
      ]);
    });

    it('should specify output directory', () => {
      expect(config.ci.collect).toHaveProperty('outputDir');
      expect(config.ci.collect.outputDir).toBe('.lighthouseci');
    });
  });

  describe('Category Score Assertions', () => {
    it('should have performance category assertion with median aggregation', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:performance');
      expect(assertions['categories:performance'][0]).toBe('warn');
      expect(assertions['categories:performance'][1]).toHaveProperty('minScore');
      expect(assertions['categories:performance'][1].minScore).toBe(0.7);
      expect(assertions['categories:performance'][1]).toHaveProperty('aggregationMethod');
      expect(assertions['categories:performance'][1].aggregationMethod).toBe('median');
    });

    it('should have accessibility score requirement as error', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:accessibility');
      expect(assertions['categories:accessibility'][0]).toBe('error');
      expect(assertions['categories:accessibility'][1]).toHaveProperty('minScore');
      expect(assertions['categories:accessibility'][1].minScore).toBe(0.9);
    });

    it('should have best practices as warning', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:best-practices');
      expect(assertions['categories:best-practices'][0]).toBe('warn');
      expect(assertions['categories:best-practices'][1].minScore).toBe(0.9);
    });

    it('should have SEO category assertion', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('categories:seo');
      expect(assertions['categories:seo'][0]).toBe('warn');
      expect(assertions['categories:seo'][1].minScore).toBe(0.9);
    });
  });

  describe('Core Web Vitals Assertions', () => {
    it('should have Largest Contentful Paint threshold', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('largest-contentful-paint');
      expect(assertions['largest-contentful-paint'][0]).toBe('warn');
      expect(assertions['largest-contentful-paint'][1]).toHaveProperty('maxNumericValue');
      expect(assertions['largest-contentful-paint'][1].maxNumericValue).toBe(2500);
    });

    it('should have Cumulative Layout Shift threshold', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('cumulative-layout-shift');
      expect(assertions['cumulative-layout-shift'][0]).toBe('warn');
      expect(assertions['cumulative-layout-shift'][1]).toHaveProperty('maxNumericValue');
      expect(assertions['cumulative-layout-shift'][1].maxNumericValue).toBe(0.1);
    });

    it('should have Total Blocking Time threshold', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('total-blocking-time');
      expect(assertions['total-blocking-time'][0]).toBe('warn');
      expect(assertions['total-blocking-time'][1]).toHaveProperty('maxNumericValue');
      expect(assertions['total-blocking-time'][1].maxNumericValue).toBe(300);
    });
  });

  describe('Individual Audit Assertions', () => {
    it('should have critical accessibility assertions', () => {
      const assertions = config.ci.assert.assertions;

      // HTML lang attribute (critical for accessibility)
      expect(assertions).toHaveProperty('html-has-lang');
      expect(assertions['html-has-lang'][0]).toBe('error');
      expect(assertions['html-has-lang'][1]).toHaveProperty('minScore', 1);

      // Viewport (critical for mobile) - audit renamed to meta-viewport in Lighthouse 12+
      expect(assertions).toHaveProperty('meta-viewport');
      expect(assertions['meta-viewport'][0]).toBe('error');
      expect(assertions['meta-viewport'][1]).toHaveProperty('minScore', 1);
    });

    it('should require meta descriptions for SEO', () => {
      const assertions = config.ci.assert.assertions;

      expect(assertions).toHaveProperty('meta-description');
      expect(assertions['meta-description'][0]).toBe('warn');
      expect(assertions['meta-description'][1]).toHaveProperty('minScore', 1);
    });

    it('should not have deprecated font-size assertion', () => {
      // font-size audit is deprecated in Lighthouse 13
      const assertions = config.ci.assert.assertions;
      expect(assertions).not.toHaveProperty('font-size');
    });

    it('should not test tap-targets (known limitation)', () => {
      // Tap targets currently fail on some elements, but this is a known limitation
      // of the family tree SVG interaction. We test this manually with mobile-ux-tester.
      const assertions = config.ci.assert.assertions;
      expect(assertions).not.toHaveProperty('tap-targets');
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
