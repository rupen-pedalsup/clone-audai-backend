import { Request, Response } from 'express';
import path from 'path';
import {
    deleteFile,
    deleteFolder,
    executeCommand,
    getFolderNameFromZip,
    streamPdfFile,
} from '@/utils';
import fs from 'fs';
import { generateHtml } from '@/utils/generateHtml';
import generatePDF from '@/utils/generatePDF';
import { solHint } from '@/utils/const';
import { exec } from 'child_process';

const extractPath = 'test/';

const post = async (req: Request, res: Response) => {
    deleteFolder(extractPath);

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Sleep for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const githubUri = req.body.githubUri;
    const zipFilePath = req.file.path;

    // Unzip the file
    console.log('Unzipping file...');
    await executeCommand('unzip', ['-o', zipFilePath, '-d', extractPath]);

    const folderName = await getFolderNameFromZip(zipFilePath);
    deleteFile(zipFilePath);

    // Change directory to the extracted folder
    process.chdir(path.join(extractPath, folderName));

    // Run npm install
    console.log('Running npm install...');
    await executeCommand('npm', ['i']);

    const jsonReportPath = 'report.json';
    const htmlReportPath = 'report.html';

    // Remove the solhint.json file if it exists
    if (fs.existsSync('.solhint.json')) {
        fs.unlinkSync('.solhint.json');
    }

    // Run solhint
    exec('npx solhint@4.5.2 --init');
    fs.writeFileSync('.solhint.json', JSON.stringify(solHint));
    exec('npx solhint@4.5.2 contracts/**/*.sol --save');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Read dir of extracted folder
    const files = fs.readdirSync(
        path.join(__dirname, '../../', extractPath, folderName),
    );
    const filteredFiles = files.filter((file) =>
        file.includes('_solhintReport.txt'),
    );

    const solhintReport = fs.readFileSync(filteredFiles[0], 'utf8');

    // Run slither
    await executeCommand('slither', [
        '.',
        '--json',
        jsonReportPath,
        '--checklist',
        '--markdown-root',
        githubUri,
    ]);

    const jsonData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    if (jsonData.success) {
        const html = await generateHtml(jsonData, githubUri, solhintReport);
        fs.writeFileSync(htmlReportPath, html);

        await generatePDF(htmlReportPath);

        process.chdir(path.join(__dirname, '../..'));
        deleteFolder(extractPath);

        const reportFilePath = 'reports/report.pdf';
        await streamPdfFile(reportFilePath, res);
        setTimeout(() => deleteFile(reportFilePath), 5000);
    } else {
        return res
            .status(400)
            .send('Error generating report. Please check the code.');
    }
};

export { post };
