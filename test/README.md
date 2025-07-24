# Test Structure

This project uses a structured approach to testing with clear separation between unit and integration tests.

## Directory Structure

```
test/
├── unit/               # Unit tests - test individual components in isolation
│   ├── objects/        # Tests for individual classes (Linter, Rule)
│   └── utils/          # Tests for utility functions
├── integration/        # Integration tests - test complete workflows
├── fixtures/           # Test data and mock files
└── README.md          # This file
```

## Unit Tests (`test/unit/`)

Unit tests focus on testing individual components in **isolation**. They should:

- Test a single class, function, or module
- Use mocks for dependencies
- Be fast and independent
- Have high code coverage
- Test edge cases and error conditions

### What to test in unit tests:

- **Objects (`test/unit/objects/`)**:
  - `Linter.test.js` - Test the Linter class behavior
  - `Rule.test.js` - Test rule creation, file matching, and execution
  
- **Utils (`test/unit/utils/`)**:
  - `loadRules.test.js` - Test rule loading logic
  - `mergeRules.test.js` - Test rule merging functionality
  - `xmlParser.test.js` - Test XML parsing utilities
  - `printer.test.js` - Test output formatting
  - `runLinterOnRepo.test.js` - Test file discovery and processing logic

## Integration Tests (`test/integration/`)

Integration tests verify that the **complete system works together**. They should:

- Test real workflows end-to-end
- Use actual files (from fixtures) when possible
- Test the public API/entry points
- Verify that components work together correctly
- Test realistic scenarios

### What to test in integration tests:

- **Complete linting workflow**:
  - `executeLinter.test.js` - Test the main `executeLinter` function
  - `customRules.test.js` - Test loading and merging custom rules
  - `multipleFiles.test.js` - Test processing multiple files
  - `errorHandling.test.js` - Test error scenarios

- **CLI integration**:
  - `command.test.js` - Test the CLI command execution

## Test Fixtures (`test/fixtures/`)

Contains sample files for testing:
- Sample Salesforce metadata files
- Custom rule files
- Expected output files
- Invalid/malformed files for error testing

## Running Tests

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run tests in watch mode
npx jest --watch

# Run specific test file
npx jest path/to/test.js
```

## Best Practices

1. **Naming**: Use descriptive test names that explain what is being tested
2. **Structure**: Use `describe` blocks to group related tests
3. **Setup**: Use `beforeEach`/`afterEach` for test setup and cleanup
4. **Mocking**: Mock external dependencies in unit tests
5. **Assertions**: Use specific assertions that clearly indicate what failed
6. **Coverage**: Aim for high coverage but focus on meaningful tests

## Example Test Structure

```javascript
import ComponentToTest from '../../src/path/ComponentToTest.js';

describe('ComponentToTest', () => {
  let component;
  
  beforeEach(() => {
    component = new ComponentToTest();
  });

  describe('methodToTest', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Test implementation  
    });

    it('should throw error on invalid input', () => {
      // Test implementation
    });
  });
});
``` 