//! HTML template module - returns an HTML string (Gray Theme)

const htmlTemplate = (
  user = {},
  resetCode = "",
  resetURL = "",
  h2Content = "",
  pContent = "",
  aContent = "",
  title = ""
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body {
      background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
      font-family: "Segoe UI", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #f5f5f5;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: #b0b0b0;
      color: #fff;
      display: flex;
      padding: 20px 30px;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .header img {
      border-radius: 50%;
      border: 2px solid #fff;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .token-box {
      background-color: #bfbfbf;
      padding: 20px;
      margin: 25px 0;
      border: 3px dashed #808080;
      border-radius: 12px;
      font-size: 28px;
      font-weight: bold;
      color: #333;
      display: inline-block;
      letter-spacing: 2px;
      background-image: linear-gradient(145deg, #e6e6e6, #d9d9d9);
    }
    .button {
      background: #b0b0b0;
      color: #fff;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 12px;
      font-size: 16px;
      display: inline-block;
      margin-top: 20px;
      transition: 0.3s;
    }
    .button:hover {
      background: #909090;
    }
    .footer {
      background-color: #d0d0d0;
      color: #555;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Carlos Elmasry Empire</h1>
      <img src="cid:userphoto" alt="User Photo" width="120" height="120" />
    </div>
    <div class="content">
      <h2>${h2Content}</h2>
      <p>Hey <strong>${user.name || ""}</strong>,</p>
      <p>${pContent}</p>
      <div class="token-box">${resetCode}</div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <a href="${resetURL}" class="button">${aContent}</a>
    </div>
    <div class="footer">
      <p>© 2025 Carlos Elmasry Empire. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`;

module.exports = htmlTemplate;
