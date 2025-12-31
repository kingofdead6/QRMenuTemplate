// src/pages/admin/AdminSocialMedia.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Music,
  Linkedin,
  Edit2,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { API_BASE_URL } from "../../../api";
// All supported platforms
const ALL_PLATFORMS = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "whatsapp",
  "tiktok",
  "linkedin",
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: MessageCircle,
  tiktok: Music,
  linkedin: Linkedin,
};

const platformColors = {
  instagram: "from-pink-500 to-purple-600",
  facebook: "from-blue-600 to-blue-800",
  youtube: "from-red-600 to-red-800",
  twitter: "from-sky-500 to-sky-700",
  whatsapp: "from-green-500 to-green-700",
  tiktok: "from-black to-gray-900",
  linkedin: "from-blue-700 to-blue-900",
};

export default function AdminSocialMedia() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [formData, setFormData] = useState({ url: "", isActive: true });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/social-media/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure all 8 platforms exist in the list (even if not in DB yet)
      const existingPlatforms = res.data.map((link) => link.platform);
      const allLinks = ALL_PLATFORMS.map((platform) => {
        const existing = res.data.find((link) => link.platform === platform);
        return (
          existing || {
            platform,
            url: "",
            isActive: false,
          }
        );
      });

      setLinks(allLinks);
    } catch (err) {
      toast.error("Failed to load social media links");
      // Fallback: show empty platforms
      setLinks(
        ALL_PLATFORMS.map((platform) => ({
          platform,
          url: "",
          isActive: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (platformObj) => {
    setSelectedPlatform(platformObj);
    setFormData({
      url: platformObj.url || "",
      isActive: platformObj.isActive || false,
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const trimmedUrl = formData.url.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      return toast.error("URL must start with http:// or https://");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/social-media/${selectedPlatform.platform}`,
        {
          platform: selectedPlatform.platform,
          url: trimmedUrl,
          isActive: formData.isActive,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        trimmedUrl
          ? "Social link updated successfully"
          : "Social link removed (set to inactive)"
      );
      setShowEditModal(false);
      fetchSocialLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update link");
    }
  };

  const handleDelete = async (platform) => {
    if (!window.confirm(`Remove ${platform.charAt(0).toUpperCase() + platform.slice(1)} link completely?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/social-media/${platform}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Link deleted");
      fetchSocialLinks();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getPlatformIcon = (platform) => {
    const Icon = platformIcons[platform];
    return <Icon size={48} className="text-white" />;
  };

  const getGradient = (platform) => platformColors[platform] || "from-gray-600 to-gray-800";

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-wider text-gray-900">
              Social Media Links
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 font-light">
              Connect your restaurant to the world
            </p>
          </div>

          {/* Grid of All Platforms */}
          {loading ? (
            <div className="text-center py-32">
              <p className="text-3xl text-gray-500">Loading platforms...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
              {links.map((link) => {
                const hasUrl = link.url && link.url.trim() !== "";
                return (
                  <motion.div
                    key={link.platform}
                    whileHover={{ y: -12, scale: 1.05 }}
                    className="group relative cursor-pointer"
                    onClick={() => openEditModal(link)}
                  >
                    <div
                      className={`relative bg-gradient-to-br ${getGradient(
                        link.platform
                      )} rounded-3xl shadow-2xl p-10 text-center transition-all duration-500 h-72 flex flex-col justify-between ${
                        !link.isActive || !hasUrl ? "opacity-70 grayscale" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex justify-center">
                        {getPlatformIcon(link.platform)}
                      </div>

                      {/* Platform Name */}
                      <h3 className="text-2xl font-bold text-white capitalize mt-6">
                        {link.platform}
                      </h3>

                      {/* URL Preview */}
                      <p className="text-white/80 text-sm mt-4 line-clamp-2 break-all">
                        {hasUrl ? link.url : "Not connected"}
                      </p>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="text-white text-center">
                          <Edit2 size={36} className="mx-auto mb-3" />
                          <p className="text-lg font-medium">Click to Edit</p>
                        </div>
                      </div>

                      {/* Active Indicator */}
                      <div className="absolute top-6 right-6">
                        {link.isActive && hasUrl ? (
                          <ToggleRight size={36} className="text-white drop-shadow-lg" />
                        ) : (
                          <ToggleLeft size={36} className="text-white/50" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Edit Modal */}
          <AnimatePresence>
            {showEditModal && selectedPlatform && (
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
              >
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                  initial={{ scale: 0.9, y: 100 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 100 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bg-gradient-to-br ${getGradient(selectedPlatform.platform)} p-10 text-white text-center`}>
                    <div className="flex justify-center mb-6">
                      {getPlatformIcon(selectedPlatform.platform)}
                    </div>
                    <h2 className="text-4xl font-bold capitalize">
                      {selectedPlatform.platform}
                    </h2>
                  </div>

                  <div className="p-10">
                    <form onSubmit={handleSave} className="space-y-8">
                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          Profile URL
                        </label>
                        <input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder={`https://${selectedPlatform.platform}.com/yourrestaurant`}
                          className="w-full px-8 py-6 text-xl border-2 border-gray-300 rounded-2xl focus:border-black outline-none transition"
                        />
                        <p className="text-sm text-gray-500 mt-3">
                          Leave empty + uncheck "Show" to hide this platform
                        </p>
                      </div>

                      <div className="flex items-center gap-5">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-8 h-8 rounded accent-black"
                        />
                        <label htmlFor="active" className="text-xl font-medium text-gray-700">
                          Show on website
                        </label>
                      </div>

                      <div className="flex gap-6 pt-8">
                        <button
                          type="submit"
                          className="cursor-pointer flex-1 py-6 bg-black text-white text-2xl font-bold rounded-2xl hover:bg-gray-800 transition shadow-xl"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="cursor-pointer flex-1 py-6 border-4 border-gray-300 text-2xl font-bold rounded-2xl hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>
                      </div>

                      {selectedPlatform.url && (
                        <div className="pt-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedPlatform.platform)}
                            className="cursor-pointer text-red-600 hover:text-red-700 font-medium text-lg underline"
                          >
                            Permanently delete this link
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </>
  );
}