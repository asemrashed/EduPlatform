'use client';

import React from 'react';
import { LuGraduationCap as GraduationCap, LuDownload as Download, LuFileText as LuFileText, LuPlay as Play, LuFolder as Folder, LuClipboard as Clipboard, LuMonitor as Monitor } from 'react-icons/lu';;

const FreebiesSection: React.FC = () => {
  const freebies = [
    'Notes',
    'Topical Past Papers', 
    'Formula Sheets',
    'Definitions/Laws',
    'Study Plan',
    'etc!'
  ];

  return (
    <section 
      className="relative py-16 lg:py-24 overflow-hidden"
    >
      {/* Background Shapes */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #71A5CF 0%, #5B8DB8 25%, #71A5CF 50%, #5B8DB8 75%, #71A5CF 100%)'
        }}
      ></div>
      
      {/* Additional Shape Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-blue-400 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-200 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-blue-500 rounded-full blur-xl"></div>
      </div>

      {/* 3D Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left - Computer Monitor */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-200 rounded-lg shadow-lg flex items-center justify-center transform rotate-12">
          <Monitor className="w-8 h-8 text-blue-600" />
        </div>

        {/* Mid Left - Clipboard */}
        <div className="absolute top-1/3 left-8 w-14 h-14 bg-white rounded-lg shadow-lg flex items-center justify-center transform -rotate-6">
          <Clipboard className="w-7 h-7 text-gray-600" />
        </div>

        {/* Lower Mid Left - Recording Device */}
        <div className="absolute bottom-1/3 left-12 w-12 h-12 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center transform rotate-6">
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
        </div>

        {/* Top Right - PDF Document */}
        <div className="absolute top-12 right-12 w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
          <LuFileText className="w-8 h-8 text-red-500" />
        </div>

        {/* Mid Right - Video Player */}
        <div className="absolute top-1/3 right-8 w-14 h-14 bg-red-500 rounded-lg shadow-lg flex items-center justify-center transform rotate-6">
          <Play className="w-6 h-6 text-white ml-1" />
        </div>

        {/* Lower Right - Folder */}
        <div className="absolute bottom-1/3 right-10 w-12 h-12 bg-yellow-400 rounded-lg shadow-lg flex items-center justify-center transform -rotate-6">
          <Folder className="w-6 h-6 text-yellow-800" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Title */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
          Explore Freebies!
        </h2>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 font-medium mb-12 leading-relaxed">
          {freebies.join(', ')}
        </p>

        {/* CTA Button */}
        <button className="inline-flex items-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-yellow-300 hover:border-yellow-400">
          <GraduationCap className="w-6 h-6" />
          <span className="text-lg">Start For Free</span>
        </button>
      </div>
    </section>
  );
};

export default FreebiesSection;
