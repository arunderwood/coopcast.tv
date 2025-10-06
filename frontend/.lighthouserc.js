const https = require('https');
const { parseStringPromise } = require('xml2js');

async function getUrlsFromSitemap(baseUrl) {
  return new Promise((resolve) => {
    const sitemapUrl = `${baseUrl}/sitemap-index.xml`;

    console.log(`Fetching sitemap from: ${sitemapUrl}`);

    https.get(sitemapUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const result = await parseStringPromise(data);
          const sitemaps = result.sitemapindex.sitemap.map(s => s.loc[0]);
          const pagesSitemap = sitemaps.find(url => url.includes('/sitemap-pages.xml'));

          if (!pagesSitemap) {
            console.log('No sitemap-pages.xml found, falling back to homepage');
            resolve([`${baseUrl}/`]);
            return;
          }

          // Fetch the pages sitemap
          https.get(pagesSitemap, (pageRes) => {
            let pageData = '';

            pageRes.on('data', (chunk) => {
              pageData += chunk;
            });

            pageRes.on('end', async () => {
              try {
                const pageResult = await parseStringPromise(pageData);
                const pageUrls = pageResult.urlset.url.map(u => u.loc[0]);
                console.log(`Found ${pageUrls.length} URLs in sitemap:`, pageUrls);
                resolve(pageUrls);
              } catch (err) {
                console.error('Error parsing pages sitemap:', err.message);
                resolve([`${baseUrl}/`]);
              }
            });
          }).on('error', (err) => {
            console.error('Error fetching pages sitemap:', err.message);
            resolve([`${baseUrl}/`]);
          });
        } catch (err) {
          console.error('Error parsing sitemap index:', err.message);
          resolve([`${baseUrl}/`]);
        }
      });
    }).on('error', (err) => {
      console.error('Error fetching sitemap:', err.message);
      resolve([`${baseUrl}/`]);
    });
  });
}

module.exports = {
  ci: {
    collect: {
      url: async () => {
        const baseUrl = process.env.LHCI_URL;
        if (!baseUrl) {
          throw new Error('LHCI_URL environment variable is required');
        }
        return await getUrlsFromSitemap(baseUrl);
      },
      numberOfRuns: 1,
      settings: {
        emulatedFormFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4
        }
      },
      outputDir: '.lighthouseci'
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'font-size': ['error'],
        'html-has-lang': ['error'],
        'viewport': ['error'],
        'meta-description': ['warn']
      }
    },
    upload: {
      target: 'filesystem',
      githubStatusContextSuffix: '/mobile'
    }
  }
};
