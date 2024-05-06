import puppeteer from 'puppeteer';
import fs from 'fs';
import { getFileContent } from './generateHtml';

async function generatePDF(inputHtmlPath: string) {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    const content = fs.readFileSync(inputHtmlPath, 'utf8');

    await page.goto(`data:text/html,${content}`, {
        waitUntil: 'domcontentloaded',
    });

    const logoSvg = await getFileContent('../public/assets/logo.svg');

    const headerTemplate = `<!DOCTYPE html>
    <html>
      <style>
        html {
          -webkit-print-color-adjust: exact;
        }
      </style>
      <body>
        <div
          style="
            position: fixed;
            top: 0;
            width: 100%;
            height: 50px;
            font-size: 10px;
            background-color: #000;
            display: flex;
            align-items: center;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              padding-inline: 40px;
            "
          >
            <a href="https://www.audai.xyz/"> ${logoSvg} </a>
            <div style="font-size: 12px; font-weight: 700; color: #ffffff">
              AUDIT REPORT
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    const footerTemplate = `<footer
    style="
      position: fixed;
      bottom: 0;
      width: 100%;
      height: 20px;
      font-size: 10px;
      color: Black;
      background-color: Black;
    ">
      <div
        style="
          font-size: 10px;
          color: rgb(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: 40px;
          margin-top: 5px;
        "
      >
        <div>Audit Report</div>
        <div style="text-align: right">
          <span>Page</span> <span class="pageNumber"></span>
        </div>
      </div>
    </footer>`;

    await page.setContent(content);

    await page.pdf({
        path: '../../reports/report.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '80px',
            bottom: '20px',
            left: '40px',
            right: '40px',
        },
        displayHeaderFooter: true,
        headerTemplate: headerTemplate,
        footerTemplate,
    });

    await browser.close();

    console.log('------Audit report generated successfully------');
}

export default generatePDF;
