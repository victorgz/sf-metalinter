class Linter {
  constructor(rules) {
    this.rules = rules;
  }

  async runOnFile(file) {
    const messages = [];

    const report = (structuredMessage) => {
      messages.push(structuredMessage);
    };

    for (const rule of this.rules) {
      // eslint-disable-next-line no-await-in-loop
      await rule.run(file, report);
    }

    return messages;
  }
}

export default Linter;
