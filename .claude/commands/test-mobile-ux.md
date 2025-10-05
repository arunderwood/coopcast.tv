---
description: Test mobile UX and responsive design
argument-hint: "[page]"
---

📱 Use the **mobile-ux-tester** subagent to perform comprehensive mobile UX testing.

Page: $ARGUMENTS (defaults to "all" if not specified)

The subagent should:
1. Start the dev server at localhost:8000 (if not already running)
2. Use Puppeteer MCP to test on iPhone SE, iPhone 12, and iPad viewports
3. Run all 6 test categories:
   - Horizontal scroll detection
   - Text readability assessment
   - Touch interaction quality
   - Visual layout comfort
   - SVG rendering quality
   - Performance feel
4. Generate detailed report with screenshots
5. Compare findings to Lighthouse CI results
6. Provide specific code fixes for issues found

Test focus: Subjective UX quality that Lighthouse CI cannot detect!
