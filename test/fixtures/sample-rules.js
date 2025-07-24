// Sample custom rules for testing
export default {
  'test-rule-required-description': {
    priority: 'error',
    include: ['**/*.object-meta.xml'],
    linter: async ({ file, report }) => {
      const content = file.raw;
      if (content && !content.includes('<description>')) {
        report('Object should have a description field', 1);
      }
    }
  },
  
  'test-rule-naming-convention': {
    priority: 'warning',
    include: ['**/*.object-meta.xml'],
    linter: async ({ file, report }) => {
      const fileName = file.path.split('/').pop();
      if (!fileName.endsWith('__c.object-meta.xml')) {
        report('Custom objects should end with __c', 1);
      }
    }
  }
}; 