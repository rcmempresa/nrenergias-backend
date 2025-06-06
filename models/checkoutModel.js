const pool = require('../config/db');  // Para usar o pool de conexões do banco de dados

// Agora aceitando o client da transação como parâmetro
const createOrder = async (client, user_id, total_amount) => {
  const query = `
    INSERT INTO orders (user_id, total_amount, payment_status, order_status, created_at, updated_at)
    VALUES ($1, $2, 'pendente', 'pendente', NOW(), NOW())
    RETURNING id;
  `;
  const values = [user_id, total_amount];

  const result = await client.query(query, values);
  return result.rows[0].id;
};

const createShippingDetails = async (client, order_id, shipping_details) => {
  const query = `
    INSERT INTO shipping_details (order_id, full_name, address, city, zip_code, country, phone, tracking_number, status, nif)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
  `;
  const values = [
    order_id,
    shipping_details.full_name,
    shipping_details.address,
    shipping_details.city,
    shipping_details.zip_code,
    shipping_details.country,
    shipping_details.phone,
    shipping_details.tracking_number || null,
    'pendente',
    shipping_details.nif || null,
  ];

  await client.query(query, values);
};

  
const createOrderItems = async (client, orderId, items) => {
  const query = `
    INSERT INTO order_items (order_id, product_id, quantity, price, total, description)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  for (const item of items) {
    const isMontagem = item.product_id === "montagem";

    const values = [
      orderId,
      isMontagem ? null : item.product_id,
      item.quantity,
      item.price,
      item.price * item.quantity,
      isMontagem ? 'Serviço de Montagem até 3m de tubo' : null
    ];

    try {
      await client.query(query, values);
    } catch (error) {
      console.error("Erro ao inserir item do pedido:", values, error);
      throw error; // para abortar a transação e ver o erro
    }
  }
};







module.exports = {
  createOrder,
  createShippingDetails,
  createOrderItems
};
