module.exports = { 
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Increase footer line length limit for automated commits (dependency updates, etc.)
    'footer-max-line-length': [2, 'always', 200],
    // Allow longer body lines for detailed release notes
    'body-max-line-length': [2, 'always', 200]
  }
};
