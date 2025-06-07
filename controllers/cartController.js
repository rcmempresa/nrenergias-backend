const cartModel = require('../models/cartModel');
const cartItemModel = require('../models/cartItemModel');
const pool = require('../config/db');


const addItemToCart = async (req, res) => {
  const { productId, quantidade, precoUnitario } = req.body;
  const userId = req.userId; 

  try {
    let cart = await cartModel.getOpenCartByUserId(userId);

    if (!cart) {
      cart = await cartModel.createCart(userId);
    }

    const existingItem = await cartItemModel.getItemInCart(cart.cart_id, productId);

    if (existingItem) {
      const newQuantity = existingItem.quantidade + quantidade;
      const updatedTotalPrice = precoUnitario * newQuantity;
      const updatedItem = await cartItemModel.updateItemInCart(existingItem.id, newQuantity, updatedTotalPrice);
      return res.json({
        message: 'Quantidade do produto atualizada no carrinho',
        item: updatedItem,
      });
    } else {
      const totalPrice = precoUnitario * quantidade;
      const newItem = await cartItemModel.addItemToCart(cart.cart_id, productId, quantidade, precoUnitario, totalPrice);
      return res.status(201).json({
        message: 'Produto adicionado ao carrinho com sucesso!!!',
        item: newItem,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao adicionar produto ao carrinho' });
  }
};

const getCartItems = async (req, res) => {
  const userId = req.userId; 
  try {
    // Chama a função do modelo para obter os itens do carrinho
    const result = await cartModel.getCartItemsByUserId(userId);

    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    // Retorna os itens do carrinho junto com o cart_id
    return res.json({
      cart_id: result.cart_id, 
      items: result.items
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao recuperar os itens do carrinho.' });
  }
};

    

const removeProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; 

  try {

    const result = await cartModel.removeProductFromCart(userId, id);

    if (result.error) {
      return res.status(404).json({ message: result.error });
    }


    return res.json({ message: result.message, product: result.product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover produto do carrinho.' });
  }
};

const increaseQuantity = async (req, res) => {
  const { cartId, productId } = req.body; 
  try {

  
    const item = await cartItemModel.getItemInCart(cartId, productId);

 
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado no carrinho.' });
    }

   
    const newQuantity = item.quantidade + 1;  
    const newTotalPrice = (item.preco_unitario * newQuantity).toFixed(2);  

    
    const updatedItem = await cartItemModel.updateItemInCart(item.id, newQuantity, newTotalPrice);

   
    return res.json(updatedItem);
  } catch (error) {
    
    return res.status(500).json({ message: 'Erro ao aumentar a quantidade do item.', error });
  }
};



const decreaseQuantity = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const item = await cartItemModel.getItemInCart(cartId, productId);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado no carrinho.' });
    }

    if (item.quantidade <= 1) {
      return res.status(400).json({ message: 'A quantidade mínima é 1. Remova o item do carrinho se não o quiser mais.' });
    }

    const newQuantity = item.quantidade - 1;
    const newTotalPrice = (item.preco_unitario * newQuantity).toFixed(2);

    const updatedItem = await cartItemModel.updateItemInCart(item.id, newQuantity, newTotalPrice);

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao diminuir a quantidade do item.', error });
  }
};




module.exports = { addItemToCart,getCartItems, removeProduct ,increaseQuantity,decreaseQuantity};
