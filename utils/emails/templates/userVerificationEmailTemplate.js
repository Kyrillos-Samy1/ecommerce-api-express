const userVerificationEmailTemplate = (
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    .header {
      background: #b0b0b0;
      color: #fff;
      text-align: center;
      padding: 20px 10px;
    }
    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }
    .header-content h1 {
      margin: 0;
      font-size: 22px;
    }
    .header-content img {
      border-radius: 50%;
      border: 3px solid #fff;
      width: 120px;
      height: 120px;
      object-fit: cover;
    }
    .content {
      padding: 20px;
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
      word-break: break-word;
    }
    .button {
      background: #888;
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
      background: #6a6a6a;
    }
    .footer {
      background-color: #d0d0d0;
      color: #555;
      text-align: center;
      padding: 15px;
      font-size: 12px;
    }

    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .header-content {
        flex-direction: column;
        gap: 10px;
      }
      h2 {
        font-size: 18px;
      }
      .token-box {
        font-size: 22px;
        padding: 15px;
      }
      .button {
        font-size: 14px;
        padding: 12px 20px;
      }
      .content {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <img src="${
          user.photo ||
          "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg"
        }" 
        alt="${user.name || "User Photo"}" />
        <h1>Welcome ${user.name || "User"}</h1>
      </div>
    </div>

    <div class="content">
      <h2>${h2Content}</h2>
      <p>Hey <strong>${user.name || ""}</strong>,</p>
      <p>${pContent}</p>
      <div class="token-box">${resetCode}</div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <a href="${encodeURI(resetURL)}" class="button">${aContent}</a>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} FastCart Inc. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`;

module.exports = userVerificationEmailTemplate;
