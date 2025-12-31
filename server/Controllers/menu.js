import asyncHandler from 'express-async-handler';
import Menu from '../Models/Menu.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';


// Get all menu items (admin)
export const getAdminMenuItems = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};

  const menuItems = await Menu.find(query).sort({ category: 1, name: 1 }).lean();
  res.status(200).json(menuItems);
});

// Get all menu items (PUBLIC - only visible ones)
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // Base query: only items that are visible on the main page
  const query = { showOnMainPage: true };

  // Optional: filter by category if provided
  if (category && category !== 'All') {
    query.category = category;
  }

  const menuItems = await Menu.find(query)
    .sort({ category: 1, name: 1 })
    .lean();

  res.status(200).json(menuItems);
});
// Create new menu item (admin)
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, price, category, showOnMainPage } = req.body;

  if (!name || !price || !category) {
    res.status(400);
    throw new Error('Name, price, and category are required');
  }

  let image = '';

  // Handle single image upload
  if (req.file) {
    image = await uploadToCloudinary(req.file);
  } else {
    res.status(400);
    throw new Error('Menu item image is required');
  }

  const menuItem = await Menu.create({
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
    image,
    showOnMainPage: showOnMainPage === 'true' || showOnMainPage === true || false,
  });

  res.status(201).json(menuItem);
});

// Update menu item (admin)
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, price, category, showOnMainPage } = req.body;

  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Update fields if provided
  if (name !== undefined) menuItem.name = name.trim();
  if (price !== undefined) menuItem.price = Number(price);
  if (category !== undefined) menuItem.category = category.trim();
  if (showOnMainPage !== undefined) {
    menuItem.showOnMainPage = showOnMainPage === 'true' || showOnMainPage === true;
  }

  // Update image if a new one is uploaded
  if (req.file) {
    menuItem.image = await uploadToCloudinary(req.file);
  }

  const updatedMenuItem = await menuItem.save();
  res.status(200).json(updatedMenuItem);
});

// Delete menu item (admin)
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  await Menu.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Menu item deleted successfully' });
});

// Toggle visibility on main menu page (admin)
export const toggleShowOnMainPage = asyncHandler(async (req, res) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  menuItem.showOnMainPage = !menuItem.showOnMainPage;
  await menuItem.save();

  res.status(200).json(menuItem);
});

