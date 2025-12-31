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
import { API_BASE_URL } from '../../../api';
import logo from '../../assets/logo.jpg';
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
            className="cursor-pointer mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
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
            <img
              src={logo}
              alt="The Azure Bistro Logo"
              className="w-24 h-24 object-cover rounded-full border-4 border-blue-600"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">The Azure Bistro</h1>

          <div className="flex items-center justify-center gap-6 mt-6 text-gray-600">
            <span className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Open {workingHours.open} - {workingHours.close}
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
                  className={`cursor-pointer px-8 py-3 rounded-full whitespace-nowrap font-semibold text-lg transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-cyan-400 text-white shadow-lg'
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
                <div className="flex items-center justify-start mb-6">
                  <h2 className="text-4xl font-bold text-gray-800 bg-clip-text mr-4">
                    {category}
                  </h2>
                  <span className=" border-1 w-full border-gray-200 mt-3" />
                </div>
              ) : null}

              <div className="space-y-10">
                {menuItems[category]?.map((item) => (
                  <div
  key={item._id}
  className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow duration-300"
>
  {/* Left Side: Text */}
  <div className="flex-1">
    <h3 className="text-3xl font-bold text-gray-900">{item.name}</h3>
    <span className="text-cyan-400 font-bold text-2xl mt-2 block">
      {Number(item.price)} DZD
    </span>
  </div>

  {/* Right Side: Image */}
  <div className="w-32 h-32 flex shrink-0">
    <img
      src={item.image || "/placeholder-food.jpg"}
      alt={item.name}
      className="w-full h-full object-cover rounded-lg"
      onError={(e) => (e.target.src = "/placeholder-food.jpg")}
    />
  </div>

</div>

                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer with Social Media */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
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