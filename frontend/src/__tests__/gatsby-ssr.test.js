/**
 * @jest-environment node
 */

describe('gatsby-ssr', () => {
  let gatsbySSR;

  beforeEach(() => {
    // Clear module cache to get fresh import
    jest.resetModules();
    gatsbySSR = require('../../gatsby-ssr');
  });

  describe('onRenderBody', () => {
    it('should export onRenderBody function', () => {
      expect(gatsbySSR.onRenderBody).toBeDefined();
      expect(typeof gatsbySSR.onRenderBody).toBe('function');
    });

    it('should set HTML lang attribute to "en"', () => {
      const mockSetHtmlAttributes = jest.fn();

      gatsbySSR.onRenderBody({ setHtmlAttributes: mockSetHtmlAttributes });

      expect(mockSetHtmlAttributes).toHaveBeenCalledTimes(1);
      expect(mockSetHtmlAttributes).toHaveBeenCalledWith({ lang: 'en' });
    });

    it('should set accessibility lang attribute for screen readers', () => {
      const mockSetHtmlAttributes = jest.fn();

      gatsbySSR.onRenderBody({ setHtmlAttributes: mockSetHtmlAttributes });

      const [callArg] = mockSetHtmlAttributes.mock.calls[0];
      expect(callArg).toHaveProperty('lang');
      expect(callArg.lang).toBe('en');
    });
  });
});
