const fetch = require('node-fetch');

const handleCheckout = async (req, res) => {
    try {
    // Recebe os dados do cliente e da transação do corpo da requisição
    const { customer, key, value, capture } = req.body;

    // Faz a requisição para a API Easypay
    const response = await fetch('https://api.test.easypay.pt/2.0/single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        AccountId: '2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6',
        ApiKey: 'eae4aa59-8e5b-4ec2-887d-b02768481a92'       
      },
      body: JSON.stringify({
        customer,
        key,
        value,
        method: 'mb',
        capture
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Erro ao criar referência Multibanco:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
  
  
module.exports = {
  handleCheckout,
};
