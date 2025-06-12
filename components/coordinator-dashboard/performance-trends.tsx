import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Student, StudentSubject } from './index';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceTrendsProps {
  student: Student;
  studentSubjects: StudentSubject[];
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ student, studentSubjects }) => {
  // Get all subjects for this student across all terms
  const studentData = studentSubjects.filter(s => s.studentId === student.id);
  
  // Create a map of all unique subjects
  const allSubjects = new Set<string>();
  studentData.forEach(termData => {
    termData.subjects.forEach(subject => {
      allSubjects.add(subject.name);
    });
  });

  // Prepare data for the chart
  const subjectPerformanceData = Array.from(allSubjects).map(subjectName => {
    const termData = [1, 2, 3, 4].map(term => {
      const termSubjects = studentData.find(s => s.term === term);
      const subject = termSubjects?.subjects.find(s => s.name === subjectName);
      return subject ? subject.finalPercentage : null;
    });

    return {
      label: subjectName,
      data: termData,
      borderColor: getColorForSubject(subjectName),
      backgroundColor: getColorForSubject(subjectName, 0.1),
      tension: 0.4,
      fill: false,
      pointRadius: 6,
      pointHoverRadius: 8,
    };
  });

  const chartData = {
    labels: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
    datasets: subjectPerformanceData,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: `${student.name} - Subject Performance Trends`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y !== null ? context.parsed.y + '%' : 'No data'}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 10,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Academic Terms',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // If no data available, show message
  if (allSubjects.size === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No performance data available for this student</p>
          <p className="text-sm text-gray-400">Data will appear here once the student submits their results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

// Helper function to generate consistent colors for subjects
function getColorForSubject(subjectName: string, alpha: number = 1): string {
  const colors = [
    `rgba(54, 162, 235, ${alpha})`,   // Blue
    `rgba(255, 99, 132, ${alpha})`,   // Red
    `rgba(75, 192, 192, ${alpha})`,   // Teal
    `rgba(255, 206, 86, ${alpha})`,   // Yellow
    `rgba(153, 102, 255, ${alpha})`,  // Purple
    `rgba(255, 159, 64, ${alpha})`,   // Orange
    `rgba(199, 199, 199, ${alpha})`,  // Gray
    `rgba(83, 102, 255, ${alpha})`,   // Indigo
    `rgba(40, 159, 64, ${alpha})`,    // Green
    `rgba(210, 99, 132, ${alpha})`,   // Pink
  ];
  
  // Create a simple hash of the subject name to ensure consistent colors
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
} 