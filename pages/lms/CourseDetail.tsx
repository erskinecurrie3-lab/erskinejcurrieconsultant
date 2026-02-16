import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Lesson {
  id: number;
  title: string;
  duration_minutes: number;
  video_url: string;
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
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  price: number;
  instructor_id: string;
  modules: Module[];
}

interface Enrollment {
  id: number;
  course_id: number;
  status: string;
  completion_percentage: number;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [enrolling, setEnrolling] = useState(false);
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

      setCourse({
        ...courseData,
        modules: modulesWithLessons
      });

      // Check if user is already enrolled
      try {
        const enrollResponse = await client.entities.enrollments.query({
          query: { course_id: parseInt(id!) },
          limit: 1
        });
        const items = enrollResponse.data.items || [];
        if (items.length > 0) {
          setEnrollment(items[0]);
        }
      } catch {
        // Not enrolled or not logged in
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(mid => mid !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleEnroll = async () => {
    if (!course) return;

    setEnrolling(true);
    try {
      if (course.price > 0) {
        // Redirect to Stripe checkout
        const response = await client.apiCall.invoke({
          url: '/api/v1/payment/create_payment_session',
          method: 'POST',
          data: {
            price_id: 'price_course_' + course.id,
            success_url: window.location.origin + `/lms/courses/${course.id}/learn`,
            cancel_url: window.location.href
          }
        });
        
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      } else {
        // Free course - create enrollment record
        const now = new Date().toISOString();
        await client.entities.enrollments.create({
          data: {
            course_id: course.id,
            enrolled_at: now,
            completion_percentage: 0,
            status: 'active',
            last_accessed_at: now
          }
        });

        toast.success('Successfully enrolled!');
        navigate(`/lms/courses/${course.id}/learn`);
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = course?.modules.reduce((sum, module) => sum + module.lessons.length, 0) || 0;
  const totalDuration = course?.modules.reduce(
    (sum, module) => sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration_minutes, 0),
    0
  ) || 0;

  const isEnrolled = !!enrollment;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/lms/courses')}
            className="text-white hover:text-[#F4E2A3] mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="text-[#F4E2A3] text-sm font-semibold mb-2 uppercase">
                {course.category}
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: course.description }} />

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-gray-400">(124 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>0 students</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <span>Created by</span>
                <span className="font-semibold text-white">{course.instructor_id}</span>
              </div>
            </div>

            {/* Right Column - Course Card */}
            <div>
              <Card className="overflow-hidden">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="mb-6">
                    {isEnrolled ? (
                      <span className="text-lg font-bold text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        You're Enrolled
                      </span>
                    ) : course.price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-black">${course.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-green-600">FREE</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button
                      onClick={() => navigate(`/lms/courses/${course.id}/learn`)}
                      className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C] h-12 text-lg font-semibold mb-4"
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C] h-12 text-lg font-semibold mb-4"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{course.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Lessons</span>
                      <span className="font-semibold">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-semibold capitalize">{course.difficulty_level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate</span>
                      <span className="font-semibold">Yes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Master the fundamentals of worship leadership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Build and manage effective worship teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Develop your spiritual leadership skills</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Course Curriculum</h2>
                  <p className="text-gray-600">
                    {course.modules.length} modules • {totalLessons} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
                  </p>
                </div>

                <div className="space-y-3">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                            <span className="font-bold text-black text-sm">{module.order_index + 1}</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-black">{module.title}</h3>
                            <p className="text-sm text-gray-600">
                              {module.lessons.length} lessons • {module.lessons.reduce((sum, l) => sum + l.duration_minutes, 0)} min
                            </p>
                          </div>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      {expandedModules.includes(module.id) && (
                        <div className="border-t-2 border-gray-200 bg-gray-50">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="px-4 py-3 flex items-center justify-between hover:bg-white transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-gray-400" />
                                <span className="text-sm">{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-600">{lesson.duration_minutes} min</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About the Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">
                      {course.instructor_id.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{course.instructor_id}</h3>
                    <p className="text-gray-600">
                      Experienced worship leader and trainer with over 15 years of ministry experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this course!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}