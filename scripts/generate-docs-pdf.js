const puppeteer = require("puppeteer");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../docs/PROJECT_DOCUMENTATION.html");
const pdfPath = path.resolve(__dirname, "../docs/PROJECT_DOCUMENTATION.pdf");

async function generatePDF() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  const fileUrl = "file:///" + htmlPath.split(path.sep).join("/");
  console.log("Loading " + fileUrl + "...");
  await page.goto(fileUrl, { waitUntil: "networkidle0" });

  console.log("Generating PDF...");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#888;">EACRMS Backend Documentation - Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log("PDF saved to " + pdfPath);
}

generatePDF().catch((err) => {
  console.error("Failed to generate PDF:", err);
  process.exit(1);
});
