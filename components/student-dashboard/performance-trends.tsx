import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface SubjectPerformance {
  name: string;
  term1: number | null;
  term2: number | null;
  term3: number | null;
  term4: number | null;
}

interface PerformanceTrendsProps {
  subjects: SubjectPerformance[];
}

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ subjects }) => {
  const chartData = {
    labels: ['Term 1', 'Term 2', 'Term 3', 'Term 4'],
    datasets: subjects.map((subject, index) => ({
      label: subject.name,
      data: [subject.term1, subject.term2, subject.term3, subject.term4],
      borderColor: getColorForIndex(index),
      backgroundColor: getColorForIndex(index, 0.1),
      tension: 0.4,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Subject Performance Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Term',
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate colors for different subjects
function getColorForIndex(index: number, alpha: number = 1): string {
  const colors = [
    `rgba(54, 162, 235, ${alpha})`,  // Blue
    `rgba(255, 99, 132, ${alpha})`,  // Red
    `rgba(75, 192, 192, ${alpha})`,  // Teal
    `rgba(255, 206, 86, ${alpha})`,  // Yellow
    `rgba(153, 102, 255, ${alpha})`, // Purple
    `rgba(255, 159, 64, ${alpha})`,  // Orange
    `rgba(199, 199, 199, ${alpha})`, // Gray
    `rgba(83, 102, 255, ${alpha})`,  // Indigo
    `rgba(40, 159, 64, ${alpha})`,   // Green
    `rgba(210, 199, 199, ${alpha})`, // Light Gray
  ];
  return colors[index % colors.length];
} 