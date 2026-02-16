import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Lock,
  GraduationCap,
  Search,
  ChevronRight,
  BarChart3,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { client } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  price: number;
  instructor_id: string;
  is_published: boolean;
}

interface Enrollment {
  id: number;
  course_id: number;
  enrolled_at: string;
  completion_percentage: number;
  status: string;
  last_accessed_at: string;
}

interface EnrolledCourse extends Course {
  enrollment_id: number;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  displayStatus: 'completed' | 'in-progress' | 'not-started';
}

export default function Modules() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    setLoading(true);
    try {
      // Load user's enrollments
      const enrollResponse = await client.entities.enrollments.query({
        query: {},
        sort: '-enrolled_at',
        limit: 100
      });
      const enrollments: Enrollment[] = enrollResponse.data.items || [];

      if (enrollments.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // Load course details for each enrollment
      const enrichedCourses: EnrolledCourse[] = [];

      for (const enrollment of enrollments) {
        try {
          const courseResponse = await client.entities.courses.get({
            id: String(enrollment.course_id)
          });
          const courseData: Course = courseResponse.data;

          // Calculate lesson counts
          let totalLessons = 0;
          try {
            const modulesResponse = await client.entities.modules.query({
              query: { course_id: enrollment.course_id },
              limit: 50
            });
            const modules = modulesResponse.data.items || [];
            for (const mod of modules) {
              const lessonsResponse = await client.entities.lessons.query({
                query: { module_id: mod.id },
                limit: 100
              });
              totalLessons += (lessonsResponse.data.items || []).length;
            }
          } catch {
            totalLessons = 5; // fallback
          }

          const pct = enrollment.completion_percentage || 0;
          const completedLessons = totalLessons > 0 ? Math.round((pct / 100) * totalLessons) : 0;
          let displayStatus: 'completed' | 'in-progress' | 'not-started' = 'not-started';
          if (enrollment.status === 'completed' || pct >= 100) {
            displayStatus = 'completed';
          } else if (pct > 0) {
            displayStatus = 'in-progress';
          }

          enrichedCourses.push({
            ...courseData,
            enrollment_id: enrollment.id,
            progress: pct,
            completed_lessons: completedLessons,
            total_lessons: totalLessons,
            displayStatus
          });
        } catch {
          // Course may have been deleted, skip
        }
      }

      setCourses(enrichedCourses);
    } catch {
      // Not logged in or no enrollments
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.displayStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedCount = courses.filter(c => c.displayStatus === 'completed').length;
  const inProgressCount = courses.filter(c => c.displayStatus === 'in-progress').length;
  const overallProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <PlayCircle className="h-5 w-5 text-blue-500" />;
      default: return <Lock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCourseClick = (course: EnrolledCourse) => {
    navigate(`/lms/courses/${course.id}/learn`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">My Courses</h1>
          <p className="text-gray-600 mt-1">Track your learning journey and continue where you left off</p>
        </div>
        <Button
          onClick={() => navigate('/lms/courses')}
          className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Browse More Courses
        </Button>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-black text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="h-8 w-8 text-[#F4E2A3]" />
              <span className="text-3xl font-bold">{overallProgress}%</span>
            </div>
            <p className="text-sm text-gray-300">Overall Progress</p>
            <Progress value={overallProgress} className="mt-2 h-2 bg-gray-700" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold text-black">{courses.length}</span>
            </div>
            <p className="text-sm text-gray-600">Enrolled Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold text-black">{completedCount}</span>
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="h-8 w-8 text-[#F4E2A3]" />
              <span className="text-3xl font-bold text-black">{inProgressCount}</span>
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed', 'not-started'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? 'bg-black text-white' : ''}
            >
              {status === 'all' ? 'All' : getStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery || filterStatus !== 'all' ? 'No courses match your filters' : 'No enrolled courses yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Browse our catalog to find courses that interest you and enroll'}
          </p>
          <Button
            onClick={() => navigate('/lms/courses')}
            className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
          >
            Browse Course Catalog
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => (
            <Card
              key={course.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-[#F4E2A3] overflow-hidden"
              onClick={() => handleCourseClick(course)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Module Number & Thumbnail */}
                  <div className="md:w-48 bg-gradient-to-br from-black to-gray-800 flex items-center justify-center p-6 relative">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#F4E2A3] rounded-full flex items-center justify-center mx-auto mb-2">
                        {course.displayStatus === 'completed' ? (
                          <CheckCircle2 className="h-8 w-8 text-black" />
                        ) : (
                          <span className="text-2xl font-bold text-black">{index + 1}</span>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(course.displayStatus)} text-white text-xs`}>
                        {getStatusLabel(course.displayStatus)}
                      </Badge>
                    </div>
                  </div>

                  {/* Right: Course Info */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                            {course.difficulty_level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-black group-hover:text-[#B8860B] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#F4E2A3] transition-colors ml-4 flex-shrink-0 mt-1" />
                    </div>

                    {/* Progress & Meta */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.completed_lessons}/{course.total_lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration_hours}h
                          </span>
                        </div>
                        <span className="font-semibold text-black">{Math.round(course.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            course.displayStatus === 'completed' ? 'bg-green-500' :
                            course.displayStatus === 'in-progress' ? 'bg-[#F4E2A3]' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(course.displayStatus)}
                        <span className="text-gray-600">
                          {course.displayStatus === 'completed' ? 'Review course material' :
                           course.displayStatus === 'in-progress' ? 'Continue where you left off' :
                           'Start this course'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className={
                          course.displayStatus === 'completed'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : course.displayStatus === 'in-progress'
                            ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]'
                            : 'bg-black text-white hover:bg-gray-800'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course);
                        }}
                      >
                        {course.displayStatus === 'completed' ? 'Review' :
                         course.displayStatus === 'in-progress' ? 'Continue' :
                         'Start'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}