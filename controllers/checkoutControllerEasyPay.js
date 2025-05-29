
const fetch = require('node-fetch'); // ou import fetch from 'node-fetch' se usares ESModules

const handleCheckout = async (req, res) => {
  try {
    // Dados da requisição para Easypay - podes receber do req.body e montar a payload correta
    const payload = {
      type: ["single"],
      payment: {
        methods: ["cc", "mb", "mbw", "dd", "vi"],
        type: "sale",
        capture: {
          descriptive: "Compra na NRenergias"
        },
        currency: "EUR",
        expiration_time: null,
      },
      order: req.body.order 
    };

    const response = await fetch('https://api.test.easypay.pt/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccountId': '2b0f63e2-9fb5-4e52-aca0-b4bf0339bbe6',
        'ApiKey': 'eae4aa59-8e5b-4ec2-887d-b02768481a92'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    const manifest = await response.json();

    return res.json(manifest);


  } catch (error) {
    console.error('Erro no handleCheckout:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  handleCheckout,
};

