'use client';

const TodayActivities = () => {
  const activities = [
    { label: 'Online Students', value: '324', color: 'bg-blue-500' },
    { label: 'Assignments Due', value: '12', color: 'bg-orange-500' },
    { label: 'Courses Active', value: '28', color: 'bg-green-500' },
    { label: 'Completion Rate', value: '87%', color: 'bg-transparent', isRevenue: true }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Today Activities</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activities.map((activity, index) => (
          <div key={index} className="text-center">
            {activity.isRevenue ? (
              <div className="text-2xl font-bold text-gray-800">{activity.value}</div>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full ${activity.color} flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold text-lg">{activity.value}</span>
                </div>
                <span className="text-sm text-gray-600">{activity.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayActivities;
