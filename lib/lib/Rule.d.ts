export = Rule;
declare class Rule {
    constructor(name: any, definition: any);
    name: any;
    priority: any;
    linter: any;
    include: any;
    exclude: any;
    run(file: any, parentReport: any): Promise<void>;
}
