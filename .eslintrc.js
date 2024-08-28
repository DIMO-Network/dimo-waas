module.exports = {
  extends: [
    'prettier',
    'next/core-web-vitals',
    'plugin:@stylistic/disable-legacy',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@stylistic'],
  rules: {
    '@stylistic/quotes': [2, 'single'],
    '@stylistic/object-curly-spacing': [2, 'never'],
    '@stylistic/space-before-function-paren': [2, 'always'],
    '@stylistic/space-before-blocks': [2, 'always'],
    '@stylistic/no-multi-spaces': 'error',
  },
};
