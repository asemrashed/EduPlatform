'use client';

import { PassPaper } from '@/types/pass-paper';
import { LuFileText as LuFileText, LuCheck as CheckCircle, LuX as XCircle, LuBookOpen as BookOpen, LuAward as Award, LuUsers as Users } from 'react-icons/lu';;

interface PassPaperStatsProps {
  passPapers: PassPaper[];
  loading?: boolean;
}

const PassPaperStats = ({ passPapers, loading = false }: PassPaperStatsProps) => {
  const activePapers = passPapers.filter(paper => paper.isActive).length;
  const inactivePapers = passPapers.filter(paper => !paper.isActive).length;
  const totalPapers = passPapers.length;
  const questionPapers = passPapers.filter(paper => paper.questionPaperUrl).length;
  const marksPdfs = passPapers.filter(paper => paper.marksPdfUrl).length;
  const workSolutions = passPapers.filter(paper => paper.workSolutionUrl).length;

  const stats = [
    {
      title: 'Total Papers',
      value: totalPapers,
      icon: LuFileText,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Active Papers',
      value: activePapers,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Inactive Papers',
      value: inactivePapers,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      title: 'Question Papers',
      value: questionPapers,
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Marks PDFs',
      value: marksPdfs,
      icon: Award,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Work Solutions',
      value: workSolutions,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassPaperStats;
