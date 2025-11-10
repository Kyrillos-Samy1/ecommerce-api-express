//! Cash Order Email Template - Gray Theme with Coupon + Original Price (Fixed for All Email Clients)
const cashOrderTemplate = (user = {}, order = {}) => {
  const {
    orderItems = [],
    finalTotalPriceAfterTaxAndShippingAdded = 0,
    totalPriceAfterCouponApplied = 0,
    totalPriceAfterDiscount = 0,
    totalOrderPriceBeforeDiscount = 0,
    couponApplied = "",
    taxPrice = 0,
    shippingPrice = 0
  } = order;

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #ccc;">
      <td style="padding:10px;">
        <img src="${item.imageCover?.url || item.images[0]?.url}" alt="${item.title}" width="80" style="display:block;border-radius:8px;" />
      </td>
      <td style="padding:10px;">${item.title}</td>
      <td style="padding:10px;">${item.color}</td>
      <td style="padding:10px;">${item.size}</td>
      <td style="padding:10px;">${item.quantity}</td>
      <td style="padding:10px;">$${item.priceAfterDiscount ? item.priceAfterDiscount : item.price}</td>
    </tr>
  `
    )
    .join("");

  const couponAppliedHtml =
    totalPriceAfterCouponApplied !== 0 &&
    (totalPriceAfterCouponApplied < totalPriceAfterDiscount ||
      totalPriceAfterCouponApplied < totalOrderPriceBeforeDiscount)
      ? `<p style="margin-top:10px;font-weight:bold;color:#444;text-align:left;">
           Coupon Applied: ${couponApplied} &nbsp;
           Discounted Price: $${totalPriceAfterCouponApplied.toFixed(2)}
         </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Cash Order Confirmation</title>
  <style>
    body {
      background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
      font-family: "Segoe UI", Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 700px;
      margin: 40px auto;
      background-color: #f5f5f5;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 10px;
      text-align: center;
    }
    th {
      background-color: #bfbfbf;
      color: #333;
    }
    .total {
      margin-top: 20px;
      font-size: 20px;
      font-weight: bold;
      text-align: left;
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
    <div class="header" style="background:#b0b0b0;color:#fff;padding:20px 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <h1 style="margin:0;font-size:22px;font-family:'Segoe UI',Arial,sans-serif;">Carlos Elmasry Empire</h1>
          </td>
          <td align="right" style="vertical-align:middle;">
            <img 
              src="${user.userPhoto?.url || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg"}" 
              alt="${user.name || "User"}" 
              width="120" 
              height="120" 
              style="border-radius:50%;border:2px solid #fff;display:block;"
            />
          </td>
        </tr>
      </table>
    </div>

    <div class="content">
      <h2>Cash Order Confirmation</h2>
      <p>Hey <strong>${user.name || ""}</strong>,</p>
      <p>Thank you for placing a cash order! Here are the details of your purchase:</p>

      <table>
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th>Color</th>
          <th>Size</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
        ${itemsHtml}
      </table>

      <p style="margin-top:10px;font-weight:bold;color:#444;text-align:left;">
        Price Before Tax & Shipping Added ${couponApplied ? "& Coupon Applied" : ""}: $${
          totalPriceAfterDiscount
            ? totalPriceAfterDiscount.toFixed(2)
            : totalOrderPriceBeforeDiscount.toFixed(2)
        }
      </p>

      <p style="margin-top:10px;font-weight:bold;color:#444;text-align:left;">
        Tax: $${taxPrice.toFixed(2)}
      </p>

      <p style="margin-top:10px;font-weight:bold;color:#444;text-align:left;">
        Shipping Price: $${shippingPrice.toFixed(2)}
      </p>

      ${couponAppliedHtml}

      <p class="total">Total Amount to Pay: $${finalTotalPriceAfterTaxAndShippingAdded.toFixed(2)}</p>
      <p>Please pay at the time of delivery. Thank you for shopping with us!</p>
    </div>

    <div class="footer">
      <p>© 2025 Carlos Elmasry Empire. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = cashOrderTemplate;
