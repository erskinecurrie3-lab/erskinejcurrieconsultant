import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import VideoPlayer from '@/components/lms/VideoPlayer';
import DiscussionList from '@/components/lms/DiscussionList';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_completed?: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  instructor_id: string;
  modules: Module[];
}

interface Enrollment {
  id: number;
  course_id: number;
  status: string;
  completion_percentage: number;
  last_accessed_at: string;
}

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('content');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const response = await client.entities.courses.get({ id: id! });
      const courseData = response.data;

      // Load modules
      const modulesResponse = await client.entities.modules.query({
        query: { course_id: parseInt(id!) },
        sort: 'order_index'
      });

      // Load lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesResponse.data.items.map(async (module: any) => {
          const lessonsResponse = await client.entities.lessons.query({
            query: { module_id: module.id },
            sort: 'order_index'
          });
          return {
            ...module,
            lessons: lessonsResponse.data.items
          };
        })
      );

      // Load completed lessons
      const progressResponse = await client.entities.user_lesson_progress.query({});
      const completed = new Set(
        progressResponse.data.items
          .filter((p: any) => p.is_completed)
          .map((p: any) => p.lesson_id)
      );
      setCompletedLessons(completed);

      setCourse({
        ...courseData,
        modules: modulesWithLessons
      });

      // Load enrollment
      try {
        const enrollResponse = await client.entities.enrollments.query({
          query: { course_id: parseInt(id!) },
          limit: 1
        });
        const items = enrollResponse.data.items || [];
        if (items.length > 0) {
          setEnrollment(items[0]);
          // Update last_accessed_at
          await client.entities.enrollments.update({
            id: String(items[0].id),
            data: { last_accessed_at: new Date().toISOString() }
          });
        } else {
          // Auto-enroll if accessing course player without enrollment
          const now = new Date().toISOString();
          const newEnroll = await client.entities.enrollments.create({
            data: {
              course_id: parseInt(id!),
              enrolled_at: now,
              completion_percentage: 0,
              status: 'active',
              last_accessed_at: now
            }
          });
          setEnrollment(newEnroll.data);
        }
      } catch {
        // Enrollment check failed, continue anyway
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleIndex: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleIndex)
        ? prev.filter(i => i !== moduleIndex)
        : [...prev, moduleIndex]
    );
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    if (!expandedModules.includes(moduleIndex)) {
      setExpandedModules([...expandedModules, moduleIndex]);
    }
  };

  const updateEnrollmentProgress = async (newCompletedSet: Set<number>) => {
    if (!course || !enrollment) return;

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    if (totalLessons === 0) return;

    const completionPct = Math.round((newCompletedSet.size / totalLessons) * 100);
    const newStatus = completionPct >= 100 ? 'completed' : 'active';

    try {
      await client.entities.enrollments.update({
        id: String(enrollment.id),
        data: {
          completion_percentage: completionPct,
          status: newStatus,
          last_accessed_at: new Date().toISOString()
        }
      });
      setEnrollment(prev => prev ? {
        ...prev,
        completion_percentage: completionPct,
        status: newStatus
      } : null);
    } catch (error) {
      console.error('Failed to update enrollment progress:', error);
    }
  };

  const markAsComplete = async () => {
    if (!course) return;

    const currentLesson = course.modules[currentModuleIndex].lessons[currentLessonIndex];
    
    try {
      await client.entities.user_lesson_progress.create({
        data: {
          lesson_id: currentLesson.id,
          is_completed: true,
          completed_at: new Date().toISOString()
        }
      });

      const newCompleted = new Set([...completedLessons, currentLesson.id]);
      setCompletedLessons(newCompleted);
      toast.success('Lesson marked as complete!');

      // Update enrollment progress
      await updateEnrollmentProgress(newCompleted);

      // Auto-advance to next lesson
      goToNextLesson();
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
      toast.error('Failed to mark lesson as complete');
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = course!.modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
    }
  };

  const goToNextLesson = () => {
    const currentModule = course!.modules[currentModuleIndex];
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < course!.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const calculateProgress = () => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    if (totalLessons === 0) return 0;
    return (completedLessons.size / totalLessons) * 100;
  };

  const hasPreviousLesson = currentModuleIndex > 0 || currentLessonIndex > 0;
  const hasNextLesson = 
    currentModuleIndex < (course?.modules.length || 0) - 1 ||
    currentLessonIndex < (course?.modules[currentModuleIndex]?.lessons.length || 0) - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-medium mb-4">Course not found</p>
          <Button onClick={() => navigate('/lms/courses')}>Back to Catalog</Button>
        </div>
      </div>
    );
  }

  const currentLesson = course.modules[currentModuleIndex]?.lessons[currentLessonIndex];
  const isInstructor = user?.id === course.instructor_id;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 bg-white border-r overflow-hidden flex-shrink-0`}>
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            onClick={() => navigate(`/lms/courses/${id}`)}
            className="mb-3 w-full justify-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <h2 className="font-bold text-lg mb-2">{course.title}</h2>
          <div className="space-y-2">
            <Progress value={calculateProgress()} className="h-2" />
            <p className="text-sm text-gray-600">
              {completedLessons.size} of {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons complete
            </p>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="border-b">
              <button
                onClick={() => toggleModule(moduleIndex)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="font-semibold text-sm">{module.title}</span>
                </div>
                {expandedModules.includes(moduleIndex) ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expandedModules.includes(moduleIndex) && (
                <div className="bg-gray-50">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isActive = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                    const isCompleted = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(moduleIndex, lessonIndex)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors ${
                          isActive ? 'bg-[#F4E2A3] bg-opacity-20 border-l-4 border-[#F4E2A3]' : ''
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.duration_minutes} min</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="content">Lesson Content</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              {/* Video Player */}
              {currentLesson?.video_url && (
                <div className="mb-6">
                  <VideoPlayer videoUrl={currentLesson.video_url} />
                </div>
              )}

              {/* Lesson Content */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-black mb-2">{currentLesson?.title}</h1>
                      {currentLesson?.description && (
                        <p className="text-gray-600">{currentLesson.description}</p>
                      )}
                    </div>
                    <Button
                      onClick={markAsComplete}
                      disabled={completedLessons.has(currentLesson?.id || 0)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {completedLessons.has(currentLesson?.id || 0) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        'Mark as Complete'
                      )}
                    </Button>
                  </div>

                  {currentLesson?.content && (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={!hasPreviousLesson}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>
                <Button
                  onClick={goToNextLesson}
                  disabled={!hasNextLesson}
                  className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="discussions">
              <DiscussionList
                courseId={parseInt(id!)}
                lessonId={currentLesson?.id}
                currentUserId={user?.id || ''}
                isInstructor={isInstructor}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-white border border-l-0 rounded-r-lg p-2 shadow-lg z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}