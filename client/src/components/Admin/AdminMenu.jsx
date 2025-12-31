// src/pages/admin/AdminMenu.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { API_BASE_URL } from "../../../api";
export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image: null,
    showOnMainPage: true,
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const fetchMenuAndCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/admin-menu`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setMenuItems(menuRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setFormData(prev => ({ ...prev, category: catRes.data[0].name }));
      }
    } catch (err) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  useEffect(() => {
    let filtered = menuItems;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: categories[0]?.name || "",
      image: null,
      showOnMainPage: true,
    });
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      return toast.error("Please fill all required fields");
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    submitData.append("showOnMainPage", formData.showOnMainPage);
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (selectedItem) {
        // Update
        await axios.put(`${API_BASE_URL}/menu/${selectedItem._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu item updated successfully");
        setShowEditModal(false);
      } else {
        // Create
        await axios.post(`${API_BASE_URL}/menu`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu item added successfully");
        setShowAddModal(false);
      }
      resetForm();
      fetchMenuAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the menu?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item deleted successfully");
      fetchMenuAndCategories();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const handleToggleVisibility = async (id, current) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/menu/${id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Visibility updated");
      fetchMenuAndCategories();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      image: null,
      showOnMainPage: item.showOnMainPage,
    });
    setImagePreview(item.image);
    setShowEditModal(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              Manage Menu
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light">
              Add, edit, and organize your restaurant menu items
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="cursor-pointer flex items-center justify-center gap-3 px-8 py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={28} />
              Add New Item
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border border-gray-300 rounded-2xl focus:border-black outline-none text-lg"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cursor-pointer px-6 py-5 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-lg font-medium"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">Loading menu items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-3xl text-gray-400 font-light mb-6">
                {searchTerm || selectedCategory !== "All" ? "No items found" : "Your menu is empty"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer text-xl text-black underline font-medium hover:text-gray-700"
              >
                Add your first menu item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden group"
                >
                  <div className="relative h-64">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                      <button
                        onClick={() => openEditModal(item)}
                        className="cursor-pointer p-4 bg-white rounded-full hover:bg-gray-100 transition"
                      >
                        <Edit2 size={24} className="text-gray-800" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        className="cursor-pointer p-4 bg-red-600 rounded-full hover:bg-red-700 transition"
                      >
                        <Trash2 size={24} className="text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-900">
                        {Number(item.price).toFixed(2)} DZD
                      </span>
                      <button
                        onClick={() => handleToggleVisibility(item._id, item.showOnMainPage)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl transition"
                      >
                        {item.showOnMainPage ? (
                          <ToggleRight size={32} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                          {item.showOnMainPage ? "Visible" : "Hidden"}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                showAddModal && setShowAddModal(false);
                showEditModal && setShowEditModal(false);
              }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extralight">
                      {showAddModal ? "Add New Menu Item" : "Edit Menu Item"}
                    </h2>
                    <button
                      onClick={() => {
                        showAddModal && setShowAddModal(false);
                        showEditModal && setShowEditModal(false);
                      }}
                      className="cursor-pointer p-3 hover:bg-gray-100 rounded-full transition"
                    >
                      <X size={32} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Price (DZD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="cursor-pointer w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none bg-white"
                          required
                        >
                          {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        Item Image {showEditModal && "(Optional - leave blank to keep current)"}
                      </label>
                      <div className="flex items-center gap-6">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl shadow-lg" />
                        )}
                        <label className="cursor-pointer flex items-center gap-4 px-8 py-6 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                          <ImageIcon size={32} className="text-gray-600" />
                          <span className="text-lg font-medium">Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="visibility"
                        checked={formData.showOnMainPage}
                        onChange={(e) => setFormData({ ...formData, showOnMainPage: e.target.checked })}
                        className="w-6 h-6 rounded"
                      />
                      <label htmlFor="visibility" className="text-lg font-medium text-gray-700">
                        Show on main menu page
                      </label>
                    </div>

                    <div className="flex gap-6 pt-8">
                      <button
                        type="submit"
                        className="cursor-pointer flex-1 py-6 bg-black text-white text-xl font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg"
                      >
                        {showAddModal ? "Add Item" : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showAddModal && setShowAddModal(false);
                          showEditModal && setShowEditModal(false);
                        }}
                        className="cursor-pointer flex-1 py-6 border-2 border-gray-300 text-xl font-bold rounded-2xl hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
}