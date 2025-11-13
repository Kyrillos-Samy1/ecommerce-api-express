//! Order Email Template - Works for Cash & Card Payments
const orderConfirmationTemplate = (user = {}, order = {}) => {
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
    return ((discountAmount / originalPrice) * 100).toFixed(2);
  };

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #ccc;">
      <td style="padding:10px;">
        <img src="${item.imageCover?.url || item.images[0]?.url}" alt="${item.title}" style="width:80px; max-width:80px; height:auto;" />
      </td>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
  <style>
    body { 
      background: linear-gradient(135deg, #d9d9d9, #bfbfbf); 
      font-family: "Segoe UI", Arial, sans-serif; 
      margin:0; padding:0; color:#333; 
    }
    .container { 
      max-width:700px; width:95%; margin:20px auto; background-color:#f5f5f5; 
      border-radius:16px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.1); 
    }
    .header {
      background:#b0b0b0;
      color:#fff;
      text-align:center;
      padding:20px 10px;
    }
    .header-content {
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:15px;
    }
    .header-content h1 {
      margin:0;
      font-size:22px;
    }
    .header-content img {
      border-radius:50%;
      border:3px solid #fff;
      width:120px;
      height:120px;
      object-fit:cover;
    }
    .content { padding:20px; text-align:center; } 
    table { width:100%; border-collapse:collapse; margin-top:20px; font-size:14px; }
    th, td { padding:8px; text-align:center; word-wrap:break-word; } 
    th { background-color:#bfbfbf; color:#333; } 
    .total { margin-top:20px; font-size:18px; font-weight:bold; text-align:left;} 
    .footer { background-color:#d0d0d0; color:#555; text-align:center; padding:15px; font-size:12px; }

    @media only screen and (max-width:600px) { 
      .header-content { flex-direction:column; gap:10px; } 
      th, td { padding:6px; font-size:12px; } 
      .content { padding:15px; } 
      .total { font-size:16px; } 
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
        alt="${user.userName || "User Photo"}" />
        <h1>Welcome ${user.userName || "User"}</h1>
      </div>
    </div>

    <div class="content">
      <h2>Order Confirmation</h2>
      <p>Dear <strong>${user.userName || ""}</strong>,</p>
      <p>Thank you for placing an order with FastCart Inc. Please find the details of your purchase below:</p>
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
      <p style="margin-top:20px; font-weight:bold; color:#444; text-align:center;">
        Total Order Price Before ${taxPrice > 0 ? "Tax &" : ""} Shipping${couponApplied ? " & (Coupon Applied)" : ""}: $${totalPriceAfterDiscount ? totalPriceAfterDiscount.toFixed(2) : totalOrderPriceBeforeDiscount.toFixed(2)}
      </p>
      ${
        couponAppliedHtml
          ? `<p style="margin-top:10px; font-weight:bold; color:#444; text-align:center;">
          Coupon Code Applied: <strong>${couponApplied}</strong> | Discount: <strong>${Math.round(percentageValue())}%</strong> | Amount: <strong>$${(Number(totalPriceAfterDiscount ?? totalOrderPriceBeforeDiscount) - Number(totalPriceAfterCouponApplied)).toFixed(2)}</strong>
        </p>`
          : ""
      }
      ${taxPrice > 0 ? `<p style="margin-top:10px; font-weight:bold; color:#444; text-align:center;">Tax Cost: $${taxPrice.toFixed(2)}</p>` : ""}
      <p style="margin-top:10px; font-weight:bold; color:#444; text-align:center;">Shipping Cost: $${shippingPrice.toFixed(2)}</p>
      <p class="total" style="margin-top:20px; text-align:center;">Total Amount Payable: $${finalTotalPriceAfterTaxAndShippingAdded.toFixed(2)}</p>
      <p style="margin-top:20px; font-weight:bold; color:#444; text-align:center;">Best regards, FastCart Inc.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} FastCart Inc. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

module.exports = orderConfirmationTemplate;
