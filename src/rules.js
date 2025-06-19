module.exports = {
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
};
