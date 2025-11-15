const orderDeliveredEmailTemplate = (
  user = {},
  paymentMethod = "",
  totalAmount = 0,
  title = "Order Delivered - FastCart Inc"
) => {
  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body { padding:0; font-family: "Segoe UI", Arial, sans-serif; background: linear-gradient(135deg, #d9d9d9, #bfbfbf);}
  .container { 
    max-width: 600px; 
    margin:0 auto; 
    background: #f5f5f5;
    border-radius: 16px; 
    overflow: hidden; 
    box-shadow: 0 8px 20px rgba(0,0,0,0.1); 
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
    padding: 30px 25px; 
    text-align: center;
    max-width: 600px; 
  }
  .content p { 
    font-size: 16px; 
    color: #333; 
    margin: 12px 0; 
  }
  .total, .payment-method, .order-id {
    font-weight: bold; 
    font-size: 18px; 
    margin: 15px 0; 
    color: #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .footer { 
    background: #d0d0d0; 
    text-align: center; 
    padding: 18px; 
    font-size: 12px; 
    color: #555; 
  }
  @media only screen and (max-width: 600px) {
    .container { width: 95% !important; }
    .header-content { flex-direction: column; gap: 10px; }
    .header h1 { font-size: 20px; }
    .content { padding: 20px 15px; max-width: 100%; }
  }
</style>
</head>
<body>
  <div style="padding: 40px 0;">
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
              <p>Your order has been <strong>successfully delivered</strong></p>
              <p class="order-id">Order ID: <strong>#${user.orderId.toLocaleString().slice(0, 6)}</strong></p>
              <p class="payment-method">Payment Method: <strong>${capitalize(paymentMethod)}</strong></p>
              <p class="total">Total Paid: <strong>${totalAmount.toLocaleString()} USD</strong></p>
              <p>Thank you for shopping with FastCart!</p>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} FastCart Inc. All Rights Reserved.
        </div>
    </div>
  </div>
</body>
</html>
`;
};

module.exports = orderDeliveredEmailTemplate;
