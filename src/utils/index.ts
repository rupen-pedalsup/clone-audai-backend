import { SpawnOptionsWithoutStdio, exec, spawn } from 'child_process';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { LintObject, IssueObject } from '@/types';

async function getFolderNameFromZip(zipFilePath: string): Promise<string> {
    const fileName = zipFilePath.split('/').pop() || '';
    const folderName = fileName.replace('.zip', '');
    return folderName;
}

function deleteFolder(folderPath: string) {
    exec(`rm -rf ${folderPath}`);
}

function deleteFile(filePath: string) {
    exec(`rm -f ${filePath}`);
}

async function getFileContent(filePath: string) {
    const cssPath = path.join(__dirname, filePath);
    const parts = cssPath.split(path.sep);
    const libIndex = parts.indexOf('bin');
    if (libIndex > -1) {
        parts.splice(libIndex, 1);
    }

    const cssFilePath = parts.join(path.sep);
    const cssContent = await fs.promises.readFile(cssFilePath, 'utf8');

    return cssContent;
}

async function executeCommand(
    command: string,
    args: string[],
    options?: SpawnOptionsWithoutStdio | undefined,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, options);

        childProcess.stdout.on('data', () => {});

        childProcess.stderr.on('data', () => {});

        childProcess.on('error', (error) => {
            console.error(`Error executing command ${command}:`, error);
            reject(error);
        });

        childProcess.on('close', (code) => {
            if (code === 0 || code === 255) {
                resolve();
            } else {
                reject(
                    new Error(
                        `Command ${command} exited with non-zero status: ${code}`,
                    ),
                );
            }
        });
    });
}

async function streamPdfFile(filePath: string, res: Response) {
    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="report.pdf"',
        );
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        return res.status(500).send('Error reading PDF file');
    }
}

function formatLint(input: string): LintObject[] {
    const result: LintObject[] = [];
    const lines = input.trim().split('\n');

    let currentFile: string = '';

    for (const line of lines) {
        const parts = line.trim().split(/\s{2,}/);

        if (parts.length === 1 && parts[0].startsWith('contracts/')) {
            result.push({ file: parts[0], issues: [] });
            currentFile = parts[0];
        }

        if (parts.length >= 2) {
            const [location, type, message, rule] = parts;
            const [lineNumber, columnNumber] = location.split(':').map(Number);

            const issue: IssueObject = {
                line: lineNumber,
                column: columnNumber,
                type,
                message,
                rule,
            };

            const current = result.find((r) => r.file === currentFile);
            if (current) {
                current.issues.push(issue);
            }
        }
    }

    return result;
}

export {
    getFolderNameFromZip,
    deleteFolder,
    deleteFile,
    getFileContent,
    executeCommand,
    streamPdfFile,
    formatLint,
};
