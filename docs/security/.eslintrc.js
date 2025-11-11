module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn', // Consider using explicit types
    '@typescript-eslint/no-explicit-any': 'off', // Allow `any` type for flexibility
    'no-unused-vars': 'off', // Allow unused variables for now
    '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'after', ignoreRestSiblings: false }],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
};