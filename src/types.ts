export interface IssueObject {
    line: number;
    column: number;
    type: string;
    message: string;
    rule: string;
}

export interface LintObject {
    file: string;
    issues: IssueObject[];
}
