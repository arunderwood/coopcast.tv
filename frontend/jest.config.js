module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^gatsby-page-utils/(.*)$': 'gatsby-page-utils/dist/$1',
    '^gatsby-core-utils/(.*)$': 'gatsby-core-utils/dist/$1',
    '^gatsby-plugin-utils/(.*)$': 'gatsby-plugin-utils/dist/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': '<rootDir>/jest-preprocess.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(gatsby|gatsby-script|gatsby-link|family-chart|d3|d3-.*)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.cache/',
    '/public/',
  ],
  globals: {
    __PATH_PREFIX__: '',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
  ],
};
