const cartModel = require('../models/cartModel');
const cartItemModel = require('../models/cartItemModel');
const pool = require('../config/db');

// Adiciona produto ou serviço ao carrinho
const addItemToCart = async (req, res) => {
  const { productId, serviceId, quantidade, precoUnitario } = req.body;
  const userId = req.userId;

  if (!productId && !serviceId) {
    return res.status(400).json({ message: 'É necessário informar productId ou serviceId.' });
  }

  try {
    let cart = await cartModel.getOpenCartByUserId(userId);
    if (!cart) {
      cart = await cartModel.createCart(userId);
    }

    const existingItem = await cartItemModel.getItemInCart(cart.cart_id, productId, serviceId);

    const precoTotal = precoUnitario * quantidade;

    if (existingItem) {
      const newQuantity = existingItem.quantidade + quantidade;
      const updatedTotalPrice = precoUnitario * newQuantity;
      const updatedItem = await cartItemModel.updateItemInCart(existingItem.id, newQuantity, updatedTotalPrice);
      return res.json({ message: 'Quantidade atualizada no carrinho', item: updatedItem });
    } else {
      const newItem = await cartItemModel.addItemToCart(cart.cart_id, productId, serviceId, quantidade, precoUnitario, precoTotal);
      return res.status(201).json({ message: 'Item adicionado ao carrinho.', item: newItem });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao adicionar item ao carrinho.' });
  }
};

// Lista todos os itens do carrinho (produtos + serviços)
const getCartItems = async (req, res) => {
  const userId = req.userId;
  try {
    const result = await cartModel.getCartItemsByUserId(userId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.json({
      cart_id: result.cart_id,
      items: result.items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao recuperar os itens do carrinho.' });
  }
};

// Remove item do carrinho (produto ou serviço)
const removeItem = async (req, res) => {
  const { productId, serviceId } = req.body;
  const userId = req.userId;

  if (!productId && !serviceId) {
    return res.status(400).json({ message: 'Informe productId ou serviceId.' });
  }

  try {
    const result = await cartModel.removeItemFromCart(userId, productId, serviceId);

    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.json({ message: result.message, item: result.item });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover item do carrinho.' });
  }
};

// Aumenta a quantidade de um item no carrinho
const increaseQuantity = async (req, res) => {
  const { cartId, productId, serviceId } = req.body;

  try {
    const item = await cartItemModel.getItemInCart(cartId, productId, serviceId);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    const newQuantity = item.quantidade + 1;
    const newTotalPrice = (item.preco_unitario * newQuantity).toFixed(2);

    const updatedItem = await cartItemModel.updateItemInCart(item.id, newQuantity, newTotalPrice);
    return res.json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao aumentar a quantidade.' });
  }
};

// Diminui a quantidade de um item no carrinho
const decreaseQuantity = async (req, res) => {
  const { cartId, productId, serviceId } = req.body;

  try {
    const item = await cartItemModel.getItemInCart(cartId, productId, serviceId);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    if (item.quantidade <= 1) {
      return res.status(400).json({ message: 'Quantidade mínima é 1. Remova o item se não desejar mais.' });
    }

    const newQuantity = item.quantidade - 1;
    const newTotalPrice = (item.preco_unitario * newQuantity).toFixed(2);

    const updatedItem = await cartItemModel.updateItemInCart(item.id, newQuantity, newTotalPrice);
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao diminuir a quantidade.' });
  }
};

module.exports = {
  addItemToCart,
  getCartItems,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
};
