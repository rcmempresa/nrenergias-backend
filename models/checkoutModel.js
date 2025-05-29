const pool = require('../config/db');  // Para usar o pool de conexões do banco de dados

// Função para criar a ordem (tabela orders)
const createOrder = async (user_id, total_amount) => {
    const client = await pool.connect();
    try {
      // Query para inserir o pedido no banco de dados
      const query = `
        INSERT INTO orders (user_id, total_amount, payment_status, order_status, created_at, updated_at)
        VALUES ($1, $2, 'pendente', 'pendente', NOW(), NOW())
        RETURNING id;
      `;
      const values = [user_id, total_amount];
      
  
      // Executa a query
      const result = await client.query(query, values);
  
      // Retorna o ID da nova ordem
      return result.rows[0].id;
    } catch (error) {
      console.error('Erro ao criar a ordem:', error);
      throw new Error('Erro ao criar a ordem: ' + error.message);
    } finally {
      client.release();
    }
  };
  
  
  

// Função para criar os detalhes de envio (tabela shipping_details)
const createShippingDetails = async (order_id, shipping_details) => {
  const client = await pool.connect(); // Conecta ao banco de dados diretamente no modelo
  try {
    const query = `
      INSERT INTO shipping_details (order_id, full_name, address, city, zip_code, country, phone, tracking_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
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
      'pendente'
    ];

    await client.query(query, values);
  } catch (error) {
    throw new Error('Erro ao criar os detalhes de envio: ' + error.message);
  } finally {
    client.release();
  }
};  
  

module.exports = {
  createOrder,
  createShippingDetails
};
