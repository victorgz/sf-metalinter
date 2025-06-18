export = Linter;
declare class Linter {
    constructor(rules: any);
    rules: any;
    runOnFile(file: any): Promise<any[]>;
}
