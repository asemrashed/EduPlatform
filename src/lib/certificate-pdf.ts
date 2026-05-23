import puppeteer from "puppeteer";

export type CertificatePdfData = {
  studentName: string;
  courseTitle: string;
  rollNo: string;
  certificateOutcomes?: string[];
};

/**
 * Certificate HTML → PDF (shared by GET /api/enrollments/[id]/certificate).
 */
export async function buildCertificatePdfBuffer(data: CertificatePdfData) {
  const outcomes = data.certificateOutcomes?.filter(
    (s) => typeof s === "string" && s.trim().length > 0,
  );
  const outcomesHtml =
    outcomes && outcomes.length > 0
      ? `<div class="outcomes"><div class="small" style="margin-top:12px;">This course recognizes that the learner has achieved:</div><ul class="outcome-list">${outcomes
          .map((o) => `<li>${String(o).replace(/</g, "&lt;")}</li>`)
          .join("")}</ul></div>`
      : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Certificate</title>
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background: #f3f4f6;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .container {
    width: 1100px;
    height: 700px;
    background: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border-radius: 16px;
    padding: 60px 60px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .ribbon {
    position: absolute;
    right: 0;
    top: 0;
    width: 160px;
    height: 100%;
    background: #ef4444;
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
  }
  .logo {
    width: 120px;
    height: auto;
    object-fit: contain;
    margin-bottom: 5px;
    align-self: center;
  }
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;
  }
  .small { color: #666; font-size: 18px; }
  .name { font-size: 48px; font-weight: 800; color: #ef4444; margin: 5px 0; }
  .course { font-size: 28px; font-weight: 700; color: #111; }
  .list { margin-top: 15px; font-size: 16px; color: #333; }
  .list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 25px;
    justify-content: center;
  }
  .outcome-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    max-width: 800px;
    text-align: center;
  }
  .outcome-list li { font-size: 15px; color: #333; margin: 4px 0; }
  .badge {
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd700, #ffc107);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 50px;
    color: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 2;
  }
  .footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    box-sizing: border-box;
    margin-top: auto;
  }
  .sign {
    text-align: center;
    font-size: 16px;
    color: #111;
    position: relative;
  }
  .line {
    width: 180px;
    border-top: 2px solid #000;
    margin-bottom: 5px;
  }
</style>
</head>
<body>
<div class="container">
  <div class="ribbon"></div>
  <div class="main-content">
    <div class="small">This is to certify that</div>
    <div class="name">${data.studentName}</div>
    <div class="small">has successfully completed the course</div>
    <div class="course">${data.courseTitle}</div>
    ${outcomesHtml}
    <div class="list">
      <ul><li>Student ID: ${data.rollNo}</li></ul>
    </div>
  </div>
  <div class="badge">✔</div>
  <div class="footer">
    <div class="sign"><div class="line"></div>Director</div>
    <div class="sign"><div class="line"></div>Director</div>
  </div>
</div>
</body>
</html>
`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      width: "1000px",
      height: "700px",
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
