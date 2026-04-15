'use client';

import { LuChevronLeft as ChevronLeft, LuChevronRight as ChevronRight } from 'react-icons/lu';;

const CalendarAndRating = () => {
  const calendarDays = [
    { day: 'SU', date: null },
    { day: 'MO', date: null },
    { day: 'TU', date: null },
    { day: 'WE', date: null },
    { day: 'TH', date: null },
    { day: 'FR', date: null },
    { day: 'SA', date: null },
    { day: null, date: 1 },
    { day: null, date: 2, highlighted: true },
    { day: null, date: 3 },
    { day: null, date: 4 },
    { day: null, date: 5 },
    { day: null, date: 6 },
    { day: null, date: 7 },
    { day: null, date: 8 },
    { day: null, date: 9, highlighted: true },
    { day: null, date: 10 },
    { day: null, date: 11 },
    { day: null, date: 12 },
    { day: null, date: 13 },
    { day: null, date: 14 },
    { day: null, date: 15 },
    { day: null, date: 16 },
    { day: null, date: 17 },
    { day: null, date: 18 },
    { day: null, date: 19 },
    { day: null, date: 20 },
    { day: null, date: 21 },
    { day: null, date: 22 },
    { day: null, date: 23 },
    { day: null, date: 24, highlighted: true },
    { day: null, date: 25 },
    { day: null, date: 26 },
    { day: null, date: 27 },
    { day: null, date: 28 },
    { day: null, date: 29 },
    { day: null, date: 30 },
    { day: null, date: 31 }
  ];

  const upcomingEvents = [
    { name: 'Web Development Exam', course: 'CS101', time: '10:00 AM' },
    { name: 'Data Science Workshop', course: 'DS201', time: '2:00 PM' },
    { name: 'Machine Learning Lab', course: 'ML301', time: '4:00 PM' }
  ];

  const ratings = [
    { category: 'Course Quality', score: 4.5 },
    { category: 'Instructor Rating', score: 4.5 },
    { category: 'Platform Usability', score: 4.2 },
    { category: 'Content Relevance', score: 4.3 },
    { category: 'Support Quality', score: 4.1 },
    { category: 'Overall Satisfaction', score: 4.3 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      {/* Calendar */}


      {/* Overall Rating */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Satisfaction (This Week)</h3>
        
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-800 mb-2">4.5/5</div>
          <div className="text-sm text-green-600 font-medium">+31%</div>
        </div>

        <div className="space-y-3">
          {ratings.map((rating, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{rating.category}</span>
                <span className="text-gray-800 font-medium">{rating.score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(rating.score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarAndRating;
