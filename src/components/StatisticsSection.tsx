'use client';

import React from 'react';
import CountdownNumber from './CountdownNumber';

const StatisticsSection: React.FC = () => {
  const stats = [
    {
      id: 1,
      value: 19.3,
      suffix: 'K+',
      label: 'ENGAGED YOUTUBE SUBSCRIBERS',
    },
    {
      id: 2,
      value: 3,
      suffix: 'K+',
      label: 'STUDENTS MENTORED GLOBALLY',
    },
    {
      id: 3,
      value: 2.4,
      suffix: 'M+',
      label: 'VIEWS ON OUR YOUTUBE CHANNEL',
    },
  ];

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Shape */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: '#CF4A53'
        }}
      ></div>
      
      {/* Background Wavy Pattern */}
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,128C672,128,768,192,864,208C960,224,1056,192,1152,170.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#F0A0A0"
            fillOpacity="0.3"
          ></path>
          <path
            d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,186.7C672,203,768,213,864,202.7C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#F0A0A0"
            fillOpacity="0.2"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={stat.id} className="flex flex-col items-center justify-center">
              <h3 className="text-6xl lg:text-7xl font-extrabold text-white mb-2" style={{
                WebkitTextStroke: '2px white',
                WebkitTextFillColor: 'transparent',
              }}>
                <CountdownNumber 
                  endValue={stat.value} 
                  suffix={stat.suffix}
                  duration={3000} 
                  delay={3000 + (index * 500)}
                />
              </h3>
              <p className="text-white text-lg lg:text-xl uppercase font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
