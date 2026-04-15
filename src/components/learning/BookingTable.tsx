'use client';

import { LuSearch as Search, LuPlus as Plus, LuEllipsis } from 'react-icons/lu';;

const BookingTable = () => {
  const assignments = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      assignmentId: 'ASG001',
      course: 'Web Development',
      dueDate: '2 days',
      status: 'Submitted',
      grade: 'A-',
      isGraded: true,
      points: '85/100'
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      assignmentId: 'ASG002',
      course: 'Data Science',
      dueDate: '4 days',
      status: 'Pending',
      grade: '-',
      isGraded: false,
      points: '0/100'
    },
    {
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      assignmentId: 'ASG003',
      course: 'Machine Learning',
      dueDate: '1 day',
      status: 'Overdue',
      grade: '-',
      isGraded: false,
      points: '0/100'
    },
    {
      name: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      assignmentId: 'ASG004',
      course: 'Mobile Development',
      dueDate: '3 days',
      status: 'Submitted',
      grade: 'B+',
      isGraded: true,
      points: '78/100'
    }
  ];

  const tabs = ['Assignments', 'Submissions', 'Graded', 'Overdue'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Assignments (4 submissions today)</h3>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                index === 0
                  ? 'bg-blue-100 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search student by name or email or assignment ID"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STUDENT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASSIGNMENT ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COURSE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DUE DATE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRADE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POINTS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{assignment.name}</div>
                    <div className="text-sm text-gray-500">{assignment.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.assignmentId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.course}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    assignment.status === 'Submitted' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.points}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="hover:text-gray-700">
                    <LuEllipsis size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-end">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
