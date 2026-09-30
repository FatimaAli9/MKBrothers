type OrderEmailRequest = {
  type?: 'created' | 'cancelled';
  order: {
    id: string;
    userName: string;
    userEmail: string;
    items: Array<{
      product: { name: string; price: number };
      quantity: number;
      size: string;
    }>;
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentMethod: 'cod';
    address: {
      street: string;
      city: string;
      state?: string;
      zipCode: string;
      country: string;
    };
    phone: string;
  };
};

const formatPrice = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('ORDER_EMAIL_FROM') || 'MK Brothers <orders@example.com>';
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), { status: 500 });
  }

  const { order, type = 'created' } = await req.json() as OrderEmailRequest;
  const cancelled = type === 'cancelled';
  const subject = cancelled ? `Order Cancelled - ${order.id}` : `Order Confirmation - ${order.id}`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name} (${item.size})</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.product.price * item.quantity)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5;">
      <h2>${cancelled ? 'Your order has been cancelled' : 'Thank you for your order'}</h2>
      <p>Hello ${order.userName},</p>
      <p>${cancelled ? 'Your cancellation request was completed.' : 'We received your order and will contact you for delivery confirmation.'}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <h3>Items</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Item</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #ddd;">Qty</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3>Shipping Address</h3>
      <p>${order.address.street}, ${order.address.city}, ${order.address.zipCode}, ${order.address.country}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Payment:</strong> Cash on Delivery</p>
      <h3>Summary</h3>
      <p>Subtotal: ${formatPrice(order.subtotal)}<br/>Shipping: ${order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}<br/><strong>Total: ${formatPrice(order.total)}</strong></p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: order.userEmail,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
