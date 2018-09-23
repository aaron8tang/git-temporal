module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '8',
        },
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-logical-assignment-operators',
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
    '@babel/plugin-proposal-do-expressions',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          test: './test',
        },
      },
    ],
  ],
};
