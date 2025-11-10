//! Cash Order Email Template - Responsive Gray Theme (Professional)
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

  const percentageValue = () => {
    const originalPrice = Number(
      totalPriceAfterDiscount ?? totalOrderPriceBeforeDiscount ?? 0
    );
    const discountedPrice = Number(totalPriceAfterCouponApplied ?? 0);

    if (originalPrice === 0) return 0;

    const discountAmount = originalPrice - discountedPrice;
    const discountPercentage = (discountAmount / originalPrice) * 100;

    return discountPercentage.toFixed(2);
  };

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #ccc;">
      <td style="padding:10px;"><img src="${item.imageCover?.url || item.images[0]?.url}" alt="${item.title}" style="width:80px; max-width:80px; height:auto;" /></td>
      <td style="padding:10px;">${item.title}</td>
      <td style="padding:10px;">${item.color}</td>
      <td style="padding:10px;">${item.size}</td>
      <td style="padding:10px;">${item.quantity}</td>
      <td style="padding:10px;">$${item.priceAfterDiscount ?? item.price}</td>
    </tr>
  `
    )
    .join("");

  const couponAppliedHtml =
    totalPriceAfterCouponApplied !== 0 &&
    (totalPriceAfterCouponApplied < totalPriceAfterDiscount ||
      totalPriceAfterCouponApplied < totalOrderPriceBeforeDiscount)
      ? `<p style="margin-top:10px; font-weight:bold; color:#444; text-align: left;">
         Coupon Code Applied: <strong>${couponApplied}</strong> |
         Discount Percentage: <strong>${Math.round(percentageValue())}%</strong> |
         Discount Amount: <strong>$${(
           Number(totalPriceAfterDiscount ?? totalOrderPriceBeforeDiscount) -
           Number(totalPriceAfterCouponApplied)
         ).toFixed(2)}</strong>
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
      width: 95%;
      margin: 20px auto;
      background-color: #f5f5f5;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .header table { width: 100%; border-collapse: collapse; }
    .header h1 { margin:0; font-size:22px; }
    .header img { display:block; border-radius:50%; border:2px solid #fff; max-width:100%; height:auto; }

    .content { padding: 20px; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    th, td { padding: 8px; text-align: center; word-wrap: break-word; }
    th { background-color: #bfbfbf; color: #333; }
    .total { margin-top: 20px; font-size: 18px; font-weight: bold; text-align: left;}
    .footer { background-color: #d0d0d0; color: #555; text-align: center; padding: 15px; font-size: 12px; }

    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .header td { display: block; text-align: center; }
      .header td img { margin: 10px auto; }
      th, td { padding: 6px; font-size: 12px; }
      .content { padding: 15px; }
      .total { font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header" style="background:#b0b0b0;color:#fff;">
      <table role="presentation">
        <tr>
          <td align="left" style="padding:10px 0;">
            <h1>Welcome ${user.name}</h1>
          </td>
          <td align="right" style="padding:10px 0;">
            <img src="${user.userPhoto?.url || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-photo-183042379.jpg"}" 
                 alt="${user.name}" width="120" height="120" />
          </td>
        </tr>
      </table>
    </div>

    <div class="content">
      <h2>Order Confirmation</h2>
      <p>Dear <strong>${user.name || ""}</strong>,</p>
      <p>Thank you for placing a cash order with FastCart Inc. Please find the details of your purchase below:</p>

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

      <p style="margin-top:10px; font-weight:bold; color:#444; text-align: left;">
        Total Order Price Before Tax & Shipping${couponApplied ? " & (Coupon Applied)" : ""}: $${totalPriceAfterDiscount ? totalPriceAfterDiscount.toFixed(2) : totalOrderPriceBeforeDiscount.toFixed(2)}
      </p>

      ${couponAppliedHtml}

      <p style="margin-top:10px; font-weight:bold; color:#444; text-align: left;">
        Tax Cost: $${taxPrice.toFixed(2)}
      </p>

      <p style="margin-top:10px; font-weight:bold; color:#444; text-align: left;">
        Shipping Cost: $${shippingPrice.toFixed(2)}
      </p>

      <p class="total">Total Amount Payable: $${finalTotalPriceAfterTaxAndShippingAdded.toFixed(2)}</p>

      <p>Please ensure payment is made upon delivery. We appreciate your business and hope to serve you again soon.</p>
    </div>

    <div class="footer">
      <p>© 2025 Carlos Elmasry Empire. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = cashOrderTemplate;
