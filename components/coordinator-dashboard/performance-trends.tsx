import React, { useState, useMemo } from 'react';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Radar as RadarIcon, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Users,
  BookOpen,
  Target,
  AlertCircle,
  Eye,
  Settings,
  BarChart,
  Activity,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import type { Student, StudentSubject } from './index';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface PerformanceTrendsProps {
  student: Student;
  studentSubjects: StudentSubject[];
}

type ChartType = 'bar' | 'line' | 'doughnut' | 'radar';
type ViewMode = 'individual' | 'comparison' | 'overview';
type PerformanceFilter = 'all' | 'excellent' | 'good' | 'needs-improvement' | 'at-risk';

export const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ student, studentSubjects }) => {
  // State for chart controls
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [selectedTerms, setSelectedTerms] = useState<number[]>([1, 2, 3, 4]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showTrendLines, setShowTrendLines] = useState(true);
  const [showAverages, setShowAverages] = useState(true);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Get all subjects for this student across all terms - Fixed data accuracy
  const studentData = useMemo(() => {
    return studentSubjects.filter(s => s.studentId === student.id);
  }, [studentSubjects, student.id]);
  
  // Create comprehensive subject analysis with accurate calculations
  const subjectAnalysis = useMemo(() => {
  const allSubjects = new Set<string>();
  studentData.forEach(termData => {
      if (termData.subjects && Array.isArray(termData.subjects)) {
    termData.subjects.forEach(subject => {
          if (subject && subject.name) {
      allSubjects.add(subject.name);
          }
        });
      }
    });

    return Array.from(allSubjects).map(subjectName => {
      const termPerformances = [1, 2, 3, 4].map(term => {
        const termSubjects = studentData.find(s => s.term === term);
        const subject = termSubjects?.subjects?.find(s => s.name === subjectName);
        return subject && typeof subject.finalPercentage === 'number' ? subject.finalPercentage : null;
      });

      const validPerformances = termPerformances.filter(p => p !== null) as number[];
      const average = validPerformances.length > 0 
        ? Math.round((validPerformances.reduce((sum, p) => sum + p, 0) / validPerformances.length) * 10) / 10
        : 0;

      // Accurate trend calculation
      let trend = 0;
      if (validPerformances.length >= 2) {
        const firstValid = validPerformances[0];
        const lastValid = validPerformances[validPerformances.length - 1];
        trend = Math.round((lastValid - firstValid) * 10) / 10;
      }

      const performanceLevel = getPerformanceLevel(average);

      return {
        name: subjectName,
        termPerformances,
        average,
        trend,
        performanceLevel,
        hasData: validPerformances.length > 0,
        consistency: calculateConsistency(validPerformances),
        improvement: trend > 5, // More than 5% improvement
        decline: trend < -5, // More than 5% decline
        stable: Math.abs(trend) <= 5, // Within 5% range
        validTerms: validPerformances.length
      };
    }).filter(subject => subject.hasData); // Only return subjects with actual data
  }, [studentData]);

  // Filter subjects based on selected filters - Enhanced accuracy
  const filteredSubjects = useMemo(() => {
    return subjectAnalysis.filter(subject => {
      // Performance filter
      if (performanceFilter !== 'all') {
        const matchesFilter = 
          (performanceFilter === 'excellent' && subject.average >= 80) ||
          (performanceFilter === 'good' && subject.average >= 60 && subject.average < 80) ||
          (performanceFilter === 'needs-improvement' && subject.average >= 40 && subject.average < 60) ||
          (performanceFilter === 'at-risk' && subject.average < 40);
        
        if (!matchesFilter) return false;
      }

      // Subject selection filter
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(subject.name)) {
        return false;
      }

      return true;
    });
  }, [subjectAnalysis, performanceFilter, selectedSubjects]);

  // Prepare chart data with accurate data handling
  const chartData = useMemo(() => {
    if (filteredSubjects.length === 0 || selectedTerms.length === 0) return null;

    const terms = selectedTerms.map(t => `Term ${t}`);
    const colors = generateColors(filteredSubjects.length);

    switch (chartType) {
      case 'bar':
        return {
          labels: terms,
          datasets: filteredSubjects.map((subject, index) => ({
            label: subject.name,
            data: selectedTerms.map(term => {
              const performance = subject.termPerformances[term - 1];
              return performance !== null ? performance : 0;
            }),
            backgroundColor: colors[index].background,
            borderColor: colors[index].border,
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          }))
        };

      case 'line':
    return {
          labels: terms,
          datasets: filteredSubjects.map((subject, index) => ({
            label: subject.name,
            data: selectedTerms.map(term => {
              const performance = subject.termPerformances[term - 1];
              return performance;
            }),
            borderColor: colors[index].border,
            backgroundColor: colors[index].background,
      tension: 0.4,
      fill: false,
            pointRadius: 7,
            pointHoverRadius: 10,
            pointBackgroundColor: colors[index].border,
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointHoverBorderWidth: 4,
            borderWidth: 3,
            spanGaps: false, // Don't connect null values
          }))
        };

      case 'doughnut':
        const averages = filteredSubjects.map(s => s.average);
        return {
          labels: filteredSubjects.map(s => s.name),
          datasets: [{
            data: averages,
            backgroundColor: colors.map(c => c.background),
            borderColor: colors.map(c => c.border),
            borderWidth: 3,
            hoverOffset: 8,
            cutout: '60%',
          }]
        };

      case 'radar':
        return {
          labels: filteredSubjects.map(s => s.name),
          datasets: selectedTerms.map((term, index) => ({
            label: `Term ${term}`,
            data: filteredSubjects.map(subject => {
              const performance = subject.termPerformances[term - 1];
              return performance !== null ? performance : 0;
            }),
            borderColor: colors[index].border,
            backgroundColor: colors[index].background,
            pointBackgroundColor: colors[index].border,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: colors[index].border,
      pointRadius: 6,
      pointHoverRadius: 8,
            borderWidth: 3,
          }))
        };

      default:
        return null;
    }
  }, [filteredSubjects, selectedTerms, chartType]);

  // Enhanced chart options with mobile responsiveness
  const getChartOptions = (): ChartOptions<any> => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart' as const,
      },
    plugins: {
      legend: {
          position: isMobile ? 'bottom' as const : 'top' as const,
          align: isMobile ? 'center' as const : 'start' as const,
        labels: {
            padding: isMobile ? 8 : 20,
          usePointStyle: true,
            pointStyle: 'circle',
            font: { 
              size: isMobile ? 10 : 13,
              weight: '500' as const,
            },
            color: '#374151',
            boxWidth: isMobile ? 8 : 12,
            boxHeight: isMobile ? 8 : 12,
            maxWidth: isMobile ? 120 : undefined,
            textAlign: 'left' as const,
          },
          maxHeight: isMobile ? 100 : undefined,
          display: filteredSubjects.length <= (isMobile ? 6 : 10),
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#F9FAFB',
          bodyColor: '#F9FAFB',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: isMobile ? 12 : 16,
          titleFont: { size: isMobile ? 12 : 14, weight: '600' as const },
          bodyFont: { size: isMobile ? 11 : 13 },
          caretPadding: 8,
          boxPadding: 8,
        },
      },
    };

    switch (chartType) {
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { 
                display: !isMobile, 
                text: 'Performance (%)',
                font: { size: 14, weight: '600' as const },
                color: '#374151',
                padding: { top: 20 }
              },
              grid: { 
                color: 'rgba(156, 163, 175, 0.2)',
                drawBorder: false,
              },
              ticks: { 
                stepSize: isMobile ? 25 : 20,
                font: { size: isMobile ? 10 : 12 },
                color: '#6B7280',
                padding: isMobile ? 4 : 8,
              },
              border: { display: false },
            },
            x: {
              title: { 
                display: !isMobile, 
                text: 'Academic Terms',
                font: { size: 14, weight: '600' as const },
                color: '#374151',
                padding: { bottom: 20 }
              },
              grid: { 
                display: false,
              },
              ticks: {
                font: { size: isMobile ? 10 : 12, weight: '500' as const },
                color: '#6B7280',
                padding: isMobile ? 4 : 8,
                maxRotation: isMobile ? 45 : 0,
              },
              border: { display: false },
            },
          },
          plugins: {
            ...baseOptions.plugins,
      tooltip: {
              ...baseOptions.plugins?.tooltip,
        callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`,
                title: (context: any) => `${context[0].label} Performance`
              }
            }
          }
        };

      case 'line':
        return {
          ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
                display: !isMobile, 
                text: 'Performance (%)',
                font: { size: 14, weight: '600' as const },
                color: '#374151',
                padding: { top: 20 }
        },
        grid: {
                color: 'rgba(156, 163, 175, 0.2)',
                drawBorder: false,
        },
        ticks: {
                stepSize: isMobile ? 25 : 20,
                font: { size: isMobile ? 10 : 12 },
                color: '#6B7280',
                padding: isMobile ? 4 : 8,
        },
              border: { display: false },
      },
      x: {
        title: {
                display: !isMobile, 
          text: 'Academic Terms',
                font: { size: 14, weight: '600' as const },
                color: '#374151',
                padding: { bottom: 20 }
        },
        grid: {
                color: 'rgba(156, 163, 175, 0.1)',
                drawBorder: false,
              },
              ticks: {
                font: { size: isMobile ? 10 : 12, weight: '500' as const },
                color: '#6B7280',
                padding: isMobile ? 4 : 8,
                maxRotation: isMobile ? 45 : 0,
              },
              border: { display: false },
            },
          },
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins?.tooltip,
              mode: 'index' as const,
              intersect: false,
              callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.y !== null ? context.parsed.y + '%' : 'No data'}`,
                title: (context: any) => `${context[0].label} Progress`
              }
            }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins?.legend,
              position: isMobile ? 'bottom' as const : 'right' as const,
              align: isMobile ? 'center' as const : 'start' as const,
              labels: {
                ...baseOptions.plugins?.legend?.labels,
                padding: isMobile ? 6 : 15,
                font: { 
                  size: isMobile ? 9 : 13,
                  weight: '500' as const,
                },
                boxWidth: isMobile ? 8 : 12,
                boxHeight: isMobile ? 8 : 12,
                maxWidth: isMobile ? 100 : undefined,
              },
              maxHeight: isMobile ? 80 : undefined,
              display: filteredSubjects.length <= (isMobile ? 5 : 10),
            },
            tooltip: {
              ...baseOptions.plugins?.tooltip,
              callbacks: {
                label: (context: any) => `${context.label}: ${context.parsed.toFixed(1)}% average`,
                title: () => 'Subject Performance'
              }
            }
          }
        };

      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: { 
                stepSize: 25,
                font: { size: isMobile ? 9 : 11 },
                color: '#6B7280',
                backdropColor: 'transparent',
                showLabelBackdrop: false,
              },
              grid: { 
                color: 'rgba(156, 163, 175, 0.3)',
              },
              pointLabels: { 
                font: { size: isMobile ? 9 : 11, weight: '500' as const },
                color: '#374151',
                padding: isMobile ? 4 : 8,
              },
              angleLines: {
                color: 'rgba(156, 163, 175, 0.3)',
              }
            },
          },
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins?.tooltip,
              callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.r}%`,
                title: (context: any) => `${context.label}`
              }
            }
          }
        };

      default:
        return baseOptions;
    }
  };

  // Accurate performance statistics
  const performanceStats = useMemo(() => {
    if (filteredSubjects.length === 0) return null;

    const averages = filteredSubjects.map(s => s.average);
    const overallAverage = Math.round((averages.reduce((sum, avg) => sum + avg, 0) / averages.length) * 10) / 10;
    
    const improving = filteredSubjects.filter(s => s.improvement).length;
    const declining = filteredSubjects.filter(s => s.decline).length;
    const stable = filteredSubjects.filter(s => s.stable).length;

    const excellent = filteredSubjects.filter(s => s.average >= 80).length;
    const good = filteredSubjects.filter(s => s.average >= 60 && s.average < 80).length;
    const needsImprovement = filteredSubjects.filter(s => s.average >= 40 && s.average < 60).length;
    const atRisk = filteredSubjects.filter(s => s.average < 40).length;

    return {
      overallAverage,
      totalSubjects: filteredSubjects.length,
      trends: { improving, declining, stable },
      performance: { excellent, good, needsImprovement, atRisk }
    };
  }, [filteredSubjects]);

  // Mobile-optimized chart type configurations
  const chartTypes = [
    { 
      type: 'bar' as ChartType, 
      icon: BarChart3, 
      label: 'Bar',
      description: 'Compare terms',
      shortLabel: 'Bar',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
    },
    { 
      type: 'line' as ChartType, 
      icon: LineChart, 
      label: 'Line',
      description: 'View trends',
      shortLabel: 'Line',
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
    },
    { 
      type: 'doughnut' as ChartType, 
      icon: PieChart, 
      label: 'Pie',
      description: 'Distribution',
      shortLabel: 'Pie',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    },
    { 
      type: 'radar' as ChartType, 
      icon: RadarIcon, 
      label: 'Radar',
      description: 'Multi-view',
      shortLabel: 'Radar',
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
    },
  ];

  // If no data available, show enhanced empty state
  if (subjectAnalysis.length === 0) {
    return (
      <Card className="h-full shadow-sm border-0 bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="text-center pb-8 px-4 sm:px-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Performance Trends
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-600 px-2 sm:px-0">
            Interactive subject performance analysis for {student.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center px-4 sm:px-6">
          <div className="max-w-sm sm:max-w-md mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">No Data Available</h3>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              Performance data will appear here once {student.name} submits their academic results.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Charts and analytics will be generated automatically from submitted data.
            </p>
      </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border-0 bg-white">
      {/* Mobile-Optimized Header */}
      <CardHeader className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 px-4 sm:px-6 relative">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Title Section - Mobile Optimized */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    Performance Trends
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 truncate">
                    {student.name} • Analysis
                  </CardDescription>
                </div>
              </div>
            </div>
            
            {/* Mobile-Friendly Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0 min-h-[44px] min-w-[44px] px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm hidden xs:inline">Filter</span>
              {isFiltersExpanded ? 
                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              }
            </Button>
          </div>
          
          {/* Mobile-Optimized Chart Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {chartTypes.map(({ type, icon: Icon, label, description, shortLabel, color }) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "outline"}
                onClick={() => setChartType(type)}
                className={`h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 ${
                  chartType === type 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" 
                    : `${color} border-2 transition-colors`
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">{window.innerWidth < 640 ? shortLabel : label}</div>
                  <div className={`text-xs mt-1 hidden sm:block ${chartType === type ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile-Optimized Filters Section */}
        {isFiltersExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="space-y-4 sm:space-y-6">
              {/* Performance Level Filter */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Performance Level</label>
                <Select value={performanceFilter} onValueChange={(value: PerformanceFilter) => setPerformanceFilter(value)}>
                  <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance Levels</SelectItem>
                    <SelectItem value="excellent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Excellent (80%+)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="good">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Good (60-79%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="needs-improvement">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Needs Improvement (40-59%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="at-risk">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">At Risk (Below 40%)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms Filter - Mobile Stacked */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Terms to Display</label>
                <div className="grid grid-cols-2 sm:flex sm:gap-4 gap-2">
                  {[1, 2, 3, 4].map(term => (
                    <div key={term} className="flex items-center space-x-2">
                      <Checkbox
                        id={`term-${term}`}
                        checked={selectedTerms.includes(term)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTerms([...selectedTerms, term]);
                          } else {
                            setSelectedTerms(selectedTerms.filter(t => t !== term));
                          }
                        }}
                        className="border-gray-300"
                      />
                      <label 
                        htmlFor={`term-${term}`} 
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Term {term}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Options */}
              <div className="space-y-2 sm:space-y-3">
                <label className="block text-sm font-semibold text-gray-700">View Options</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-averages"
                      checked={showAverages}
                      onCheckedChange={setShowAverages}
                      className="border-gray-300"
                    />
                    <label 
                      htmlFor="show-averages" 
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Show Statistics
                    </label>
                  </div>
                </div>
              </div>

              {/* Mobile Close Filters Button */}
              <div className="sm:hidden pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFiltersExpanded(false)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Close Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-8 px-4 sm:px-6">
        {/* Mobile-Optimized Performance Statistics */}
        {performanceStats && showAverages && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              Performance Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-indigo-600">
                  {performanceStats.overallAverage.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Overall Average</div>
                <div className="text-xs text-gray-500 hidden sm:block">Across all subjects</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-green-600 flex items-center justify-center gap-1 sm:gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
                  {performanceStats.trends.improving}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Improving</div>
                <div className="text-xs text-gray-500 hidden sm:block">Upward trends</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-red-600 flex items-center justify-center gap-1 sm:gap-2">
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6" />
                  {performanceStats.trends.declining}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Declining</div>
                <div className="text-xs text-gray-500 hidden sm:block">Need attention</div>
              </div>
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-3xl font-bold text-gray-600 flex items-center justify-center gap-1 sm:gap-2">
                  <Minus className="h-4 w-4 sm:h-6 sm:w-6" />
                  {performanceStats.trends.stable}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Stable</div>
                <div className="text-xs text-gray-500 hidden sm:block">Consistent</div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Chart Display */}
        {chartData && selectedTerms.length > 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6">
            {/* Mobile Legend Warning */}
            {typeof window !== 'undefined' && window.innerWidth < 768 && filteredSubjects.length > 6 && (
              <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700 text-center">
                  Legend hidden with {filteredSubjects.length} subjects. Use filters to reduce for better view.
                </p>
              </div>
            )}
            
            <div className="h-[300px] sm:h-[400px] relative">
              {chartType === 'bar' && <Bar data={chartData} options={getChartOptions()} />}
              {chartType === 'line' && <Line data={chartData} options={getChartOptions()} />}
              {chartType === 'doughnut' && <Doughnut data={chartData} options={getChartOptions()} />}
              {chartType === 'radar' && <Radar data={chartData} options={getChartOptions()} />}
            </div>
            
            {/* Mobile Alternative Legend */}
            {typeof window !== 'undefined' && window.innerWidth < 768 && filteredSubjects.length > 6 && (
              <div className="mt-3 space-y-1">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Subjects:</h5>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {filteredSubjects.map((subject, index) => {
                    const colors = generateColors(filteredSubjects.length);
                    return (
                      <div key={subject.name} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: colors[index].border }}
                        ></div>
                        <span className="text-gray-700 truncate">{subject.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 p-6 sm:p-12 text-center">
            <Filter className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Data Matches Your Filters</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">Try adjusting the filters above to see performance data</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setPerformanceFilter('all');
                setSelectedTerms([1, 2, 3, 4]);
              }}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Mobile-Optimized Subject Performance Summary */}
        {filteredSubjects.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <Separator className="my-4 sm:my-6" />
            <div className="flex items-center justify-between">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                Subject Summary
              </h4>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {filteredSubjects.length} Subject{filteredSubjects.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredSubjects.map(subject => (
                <div 
                  key={subject.name} 
                  className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h5 className="font-semibold text-gray-900 text-sm truncate pr-2">
                      {subject.name}
                    </h5>
                    <Badge 
                      variant={subject.average >= 80 ? "default" : subject.average >= 60 ? "secondary" : "destructive"}
                      className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 ${
                        subject.average >= 80 ? "bg-green-100 text-green-800 hover:bg-green-200" :
                        subject.average >= 60 ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                        "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {subject.average.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      {subject.improvement && (
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-medium">Improving</span>
                        </div>
                      )}
                      {subject.decline && (
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-medium">Declining</span>
                        </div>
                      )}
                      {subject.stable && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-medium">Stable</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.abs(subject.trend).toFixed(1)}% change
                    </div>
                  </div>
                </div>
              ))}
            </div>
    </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced helper functions with accuracy improvements
function getPerformanceLevel(average: number): string {
  if (average >= 80) return 'excellent';
  if (average >= 60) return 'good';
  if (average >= 40) return 'needs-improvement';
  return 'at-risk';
}

function calculateConsistency(performances: number[]): number {
  if (performances.length < 2) return 0;
  const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
  const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function generateColors(count: number) {
  const enhancedColors = [
    { background: 'rgba(59, 130, 246, 0.15)', border: 'rgb(59, 130, 246)' }, // Blue
    { background: 'rgba(16, 185, 129, 0.15)', border: 'rgb(16, 185, 129)' }, // Green
    { background: 'rgba(245, 158, 11, 0.15)', border: 'rgb(245, 158, 11)' }, // Amber
    { background: 'rgba(239, 68, 68, 0.15)', border: 'rgb(239, 68, 68)' }, // Red
    { background: 'rgba(139, 92, 246, 0.15)', border: 'rgb(139, 92, 246)' }, // Violet
    { background: 'rgba(236, 72, 153, 0.15)', border: 'rgb(236, 72, 153)' }, // Pink
    { background: 'rgba(6, 182, 212, 0.15)', border: 'rgb(6, 182, 212)' }, // Cyan
    { background: 'rgba(251, 113, 133, 0.15)', border: 'rgb(251, 113, 133)' }, // Rose
    { background: 'rgba(34, 197, 94, 0.15)', border: 'rgb(34, 197, 94)' }, // Emerald
    { background: 'rgba(168, 85, 247, 0.15)', border: 'rgb(168, 85, 247)' }, // Purple
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(enhancedColors[i % enhancedColors.length]);
  }
  return colors;
} 