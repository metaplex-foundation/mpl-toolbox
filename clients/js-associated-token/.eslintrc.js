module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  plugins: ['prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './clients/js-associated-token/tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    'class-methods-use-this': 'off',
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'max-classes-per-file': 'off',
  },
  ignorePatterns: ['dist/**', '.eslintrc.js'],
};
