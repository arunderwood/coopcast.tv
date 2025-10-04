const babelOptions = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};

module.exports = require('babel-jest').default.createTransformer(babelOptions);
