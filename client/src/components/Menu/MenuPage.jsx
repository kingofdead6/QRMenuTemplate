// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Music,
  Linkedin,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: MessageCircle,
  tiktok: Music,
  linkedin: Linkedin,
};

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState({});
  const [workingHours, setWorkingHours] = useState({ open: '11:00', close: '22:00' });
  const [socialLinks, setSocialLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menuRes, hoursRes, socialRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/menu`),
          axios.get(`${API_BASE_URL}/working-times`),
          axios.get(`${API_BASE_URL}/social-media`), // Fetch active social links
        ]);

        // Format time to 12-hour (e.g., 9:30pm)
        const formatTime = (time24) => {
          if (!time24) return '--:--';
          const [hour, minute] = time24.split(':');
          const h = parseInt(hour, 10);
          const ampm = h >= 12 ? 'pm' : 'am';
          const displayHour = h % 12 || 12;
          return `${displayHour}:${minute}${ampm}`;
        };

        setWorkingHours({
          open: formatTime(hoursRes.data.open),
          close: formatTime(hoursRes.data.close),
        });

        setSocialLinks(socialRes.data); // Only active links

        // Group menu items by category
        const groupedItems = menuRes.data.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});

        const sortedCategories = Object.keys(groupedItems).sort();
        setCategories(['All', ...sortedCategories]);
        setMenuItems(groupedItems);
        setSelectedCategory('All');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayCategories = selectedCategory === 'All'
    ? categories.filter(cat => cat !== 'All')
    : [selectedCategory];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-2xl font-bold text-red-600 mb-4">Oops!</p>
          <p className="text-lg text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-2xl flex items-center justify-center text-white text-4xl font-bold">
              AB
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">The Azure Bistro</h1>
          <p className="text-xl text-gray-600 mt-2">Fresh flavors by the coast</p>

          <div className="flex items-center justify-center gap-6 mt-6 text-gray-600">
            <span className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Open {workingHours.open} - {workingHours.close}
            </span>
            <span className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.8 <span className="text-gray-500">(1.2k reviews)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Category Filter Bar */}
      {categories.length > 1 && (
        <div className="sticky top-0 z-20 bg-white border-b shadow-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-4 py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-8 py-3 rounded-full whitespace-nowrap font-semibold text-lg transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 pb-24 w-full">
        {displayCategories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No menu items available yet.</p>
          </div>
        ) : (
          displayCategories.map((category) => (
            <section key={category} className="mb-16">
              {selectedCategory !== 'All' || displayCategories.length > 1 ? (
                <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {category}
                </h2>
              ) : null}

              <div className="space-y-10">
                {menuItems[category]?.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col sm:flex-row gap-6 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="sm:w-48 sm:h-48 w-full h-64 flex-shrink-0">
                      <img
                        src={item.image || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none"
                        onError={(e) => (e.target.src = '/placeholder-food.jpg')}
                      />
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                            {item.description}
                          </p>
                        )}
                        {item.isGlutenFree && (
                          <span className="inline-block px-5 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-full">
                            Gluten Free
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-8">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {Number(item.price).toFixed(2)} DZD
                        </span>
                        <button className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-xl">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer with Social Media */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">The Azure Bistro</h2>
          <p className="text-gray-400 mb-8">Fresh flavors by the coast</p>

          <div className="flex items-center justify-center gap-3 text-gray-400 mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Open {workingHours.open} - {workingHours.close}</span>
          </div>

          {/* Social Media Icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-8 mb-10">
              {socialLinks.map((link) => {
                const Icon = platformIcons[link.platform];
                if (!Icon) return null;

                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-3xl hover:scale-125 transition-transform duration-300"
                    aria-label={link.platform}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}

          <p className="text-gray-500 text-sm">
            © 2025 The Azure Bistro. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MenuPage;