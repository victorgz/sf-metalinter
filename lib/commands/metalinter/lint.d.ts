export = MetalinterLint;
declare class MetalinterLint extends Command {
    run(): Promise<void>;
    printResults(results: any): void;
}
declare namespace MetalinterLint {
    let description: string;
    namespace flags {
        let path: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
        let rules: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
    }
}
import { Command } from "@oclif/core";
