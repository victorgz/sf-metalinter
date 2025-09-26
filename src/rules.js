/* eslint-disable max-len */
export default {
  'missing-description': {
    priority: 2,
    description: 'XML metadata is missing description',
    linter: function ({ file, report }) {
      const description = file.parsedXml?.get('//description');
      if (!description) {
        report('XML metadata is missing description');
      }
    },
  },
  'deprecated-api-version': {
    priority: 2,
    description: 'API Version is deprecated (< 30.0)',
    linter: function ({ file, report }) {
      const apiVersion = file.parsedXml?.get('//apiVersion');
      if (apiVersion && parseFloat(apiVersion.text()) < 30.0) {
        report('API Version is deprecated: ' + parseFloat(apiVersion.text()), apiVersion.line());
      }
    },
  },
  'flow-inactive': {
    priority: 3,
    description: 'Flow should be active',
    linter: function ({ file, report }) {
      const status = file.parsedXml?.get('//status');
      if (status && status.text() !== 'Active') {
        report('Flow is not active', status.line());
      }
    },
    include: ['**/*.flow-meta.xml'],
  },
  'object-internal-sharing-no-readwrite': {
    priority: 3,
    description: 'Object internal sharing should not be set to Public Read/Write',
    linter: function ({ file, report }) {
      const sharingModel = file.parsedXml?.get('//sharingModel');
      if (sharingModel?.text() === 'ReadWrite') {
        report('Object internal sharing is Public ReadWrite', sharingModel.line());
      }
    },
    include: ['**/*.object-meta.xml'],
  },
  'object-external-sharing-no-readwrite': {
    priority: 1,
    description: 'Object external sharing should not be set to Public ReadWrite',
    linter: function ({ file, report }) {
      const sharingModel = file.parsedXml?.get('//externalSharingModel');
      if (sharingModel?.text() === 'ReadWrite') {
        report('Object external sharing is Public Read/Write', sharingModel.line());
      }
    },
    include: ['**/*.object-meta.xml'],
  },
  'named-credential-no-hardcoded-password': {
    priority: 1,
    description: 'Named Credential should not have a password explicitly set',
    linter: function ({ file, report }) {
      if (file.parsedXml?.get('//protocol')?.text() === 'Password') {
        const password = file.parsedXml?.get('//password');
        if (password) {
          report('Named Credential has a password explicitly set', password.line());
        }
      }
    },
    include: ['**/*.namedCredential-meta.xml'],
  },
  'flow-avoid-copy-elements': {
    priority: 2,
    description:
      'Avoid default API names like "Copy_X_Of_Element". Rename copied elements for better Flow readability.',
    linter: function ({ file, report }) {
      // Check for Flow elements with copy naming pattern
      const copyPattern = /Copy_[0-9]+_of_[A-Za-z0-9]+/;

      // Find all <name> elements (not name attributes)
      const elementsWithNames = file.parsedXml?.getAll('//name');

      if (elementsWithNames) {
        for (const element of elementsWithNames) {
          // Get the text content of the <name> element
          const elementName = element.text();
          if (elementName && copyPattern.test(elementName)) {
            report(
              `Flow element "${elementName}" uses copy naming pattern. Consider updating the API name for better readability.`,
              element.line()
            );
          }
        }
      }
    },
    include: ['**/*.flow-meta.xml'],
  },
  'flow-get-records-prevent-all-fields': {
    priority: 2,
    description:
      'Get Records elements should not use "Get All Fields" without specifying specific fields to query. This can impact performance and should be avoided.',
    linter: function ({ file, report }) {
      // Find all Get Records elements that have storeOutputAutomatically=true
      const problematicElements = file.parsedXml?.getAll(
        '//recordLookups[storeOutputAutomatically="true" and not(queriedFields)]'
      );

      if (problematicElements) {
        for (const element of problematicElements) {
          if (!element) continue;

          // Get the name of this specific element
          const nameNodes = file.parsedXml?.getAll(
            '//recordLookups[storeOutputAutomatically="true" and not(queriedFields)]/name'
          );
          const elementName = nameNodes && nameNodes.length > 0 ? nameNodes[0].text() : 'Unnamed Get Records element';

          report(
            `Get Records element "${elementName}" uses "Get All Fields" without specifying specific fields. This can impact performance.`,
            element.line()
          );
        }
      }
    },
    include: ['**/*.flow-meta.xml'],
  },
};
