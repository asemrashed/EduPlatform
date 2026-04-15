'use client';

import { LuTrendingUp as TrendingUp, LuTrendingDown as TrendingDown, LuUsers as Users, LuBookOpen as BookOpen, LuUserPlus as UserPlus } from 'react-icons/lu';;

const KPICards = () => {
  const kpiData = [
    {
      title: 'Active Students (This week)',
      value: '1,247',
      change: '+18%',
      changeType: 'positive',
      previousWeek: 'Previous week: 1,056',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Course Completions (This week)',
      value: '89',
      change: '+12%',
      changeType: 'positive',
      previousWeek: 'Previous week: 79',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      title: 'New Enrollments (This week)',
      value: '156',
      change: '+25%',
      changeType: 'positive',
      previousWeek: 'Previous week: 125',
      icon: UserPlus,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
      {kpiData.map((kpi, index) => (
        <div key={index} className={`relative group overflow-hidden rounded-xl bg-gradient-to-br ${kpi.bgGradient} p-4 shadow-md border border-gray-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]`}>
          {/* Educational Geometric Background Elements */}
          <div className="absolute top-0 right-0 w-12 h-12 opacity-10 flex items-center justify-center">
            <div className="w-8 h-8 border border-blue-200 rounded-full relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-blue-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-blue-300 rotate-180"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-10 h-10 opacity-5 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-purple-300"></div>
            <div className="absolute w-0.5 h-6 bg-purple-300"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.gradient} shadow-md`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                kpi.changeType === 'positive' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
              }`}>
                {kpi.changeType === 'positive' ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {kpi.change}
              </div>
            </div>
            
            <h3 className="text-xs font-semibold text-gray-600 mb-2 leading-tight">{kpi.title}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold bg-gradient-to-r ${kpi.gradient} bg-clip-text text-transparent`}>
                {kpi.value}
              </span>
              <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 bg-gradient-to-r ${kpi.gradient} rounded-full animate-pulse`}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">{kpi.previousWeek}</p>
          </div>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
