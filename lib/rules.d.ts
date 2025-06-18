declare const _exports: {
    'missing-description': {
        priority: number;
        description: string;
        linter: ({ file, report }: {
            file: any;
            report: any;
        }) => void;
    };
    'deprecated-api-version': {
        priority: number;
        description: string;
        linter: ({ file, report }: {
            file: any;
            report: any;
        }) => void;
    };
    'flow-inactive': {
        priority: number;
        description: string;
        linter: ({ file, report }: {
            file: any;
            report: any;
        }) => void;
        include: string[];
    };
    'object-internal-sharing-no-readwrite': {
        priority: number;
        description: string;
        linter: ({ file, report }: {
            file: any;
            report: any;
        }) => void;
        include: string[];
    };
    'object-external-sharing-no-readwrite': {
        priority: number;
        description: string;
        linter: ({ file, report }: {
            file: any;
            report: any;
        }) => void;
        include: string[];
    };
};
export = _exports;
