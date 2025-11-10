//! Responsive Forget Password Email Template - Gray Theme
const forgetPasswordTemplate = (
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
      width: 95%;
      margin: 20px auto;
      background-color: #f5f5f5;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    .content { padding: 20px; text-align: center; }
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
      word-break: break-word;
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
    .button:hover { background: #909090; }
    .footer { background-color: #d0d0d0; color: #555; text-align: center; padding: 15px; font-size: 12px; }

    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .header td { display: block; text-align: center; }
      .header td img { margin: 10px auto; width: 100px; height: auto; }
      h2 { font-size: 18px; }
      .token-box { font-size: 22px; padding: 15px; }
      .button { font-size: 14px; padding: 12px 20px; }
      .content { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background:#b0b0b0;color:#fff;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
        <tr>
          <td align="left" style="padding:10px 0;">
            <h1 style="margin:0;padding:0;font-size:22px;">${user.name} Empire</h1>
          </td>
          <td align="right" style="padding:10px 0;">
            <img src="${user.userPhoto?.url || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg"}" 
                 alt="${user.name}" width="120" height="120" style="display:block;border-radius:50%;border:2px solid #fff;" />
          </td>
        </tr>
      </table>
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

module.exports = forgetPasswordTemplate;
