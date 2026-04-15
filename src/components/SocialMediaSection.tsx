'use client';

import React from 'react';
import { LuPlay as Play, LuYoutube as Youtube, LuInstagram as Instagram } from 'react-icons/lu';

const SocialMediaSection: React.FC = () => {
  const youtubeVideos = [
    // Replace these with your actual YouTube video IDs
    { id: 1, title: "Magnetic Flux Explained", videoId: "8qr0CqKul9A" },
    { id: 2, title: "Projectile Motion Basics", videoId: "2Z4m4lnjxkY" },
    { id: 3, title: "Ohm's Law Intuition", videoId: "TzRfKFsLiHM" },
    { id: 4, title: "Fleming's Left-Hand Rule", videoId: "ADgJiiIkEG4" },
    { id: 5, title: "Waves and Interference", videoId: "mvHheGp216g" },
    { id: 6, title: "Thermodynamics First Law", videoId: "Hk7tzYMyqFg" }
  ];

  const instagramPosts = [
    // Replace these with your actual Instagram shortcodes and titles
    // For posts: https://www.instagram.com/p/{shortcode}/, for reels: https://www.instagram.com/reel/{shortcode}/
    { id: 1, title: "IG Post 1", shortcode: "C8abcdef1" },
    { id: 2, title: "IG Reel 2", shortcode: "C7ghijkL2" },
    { id: 3, title: "IG Post 3", shortcode: "C6mnopqR3" }
  ];

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* YouTube Videos Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Check out our latest Youtube videos!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <a
              href="https://www.youtube.com/@physicswithtalha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Youtube className="w-6 h-6" />
              <span>► JOIN OUR YOUTUBE FAMILY</span>
            </a>
          </div>
        </div>

        {/* Instagram Posts Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Check out our latest Instagram posts!
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {instagramPosts.map((post) => (
              <div key={post.id} className="relative group">
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-square">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.instagram.com/p/${post.shortcode}/embed`}
                      title={post.title}
                      loading="lazy"
                      allowTransparency
                      frameBorder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <a
              href="https://www.instagram.com/physicswithtalha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Instagram className="w-6 h-6" />
              <span>JOIN OUR INSTAGRAM FAMILY</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
