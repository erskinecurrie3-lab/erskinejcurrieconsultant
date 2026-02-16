import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Star, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    thumbnail_url?: string;
    category: string;
    difficulty_level: string;
    duration_hours: number;
    price: number;
    instructor_id: string;
  };
  enrollment?: {
    id: number;
    status: string;
    completion_percentage: number;
  } | null;
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const navigate = useNavigate();

  const isEnrolled = !!enrollment;
  const completionPct = enrollment?.completion_percentage || 0;
  const isCompleted = enrollment?.status === 'completed' || completionPct >= 100;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(`/lms/courses/${course.id}/learn`);
    } else {
      navigate(`/lms/courses/${course.id}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/lms/courses/${course.id}`)}>
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F4E2A3] to-[#E6D08C]">
            <span className="text-4xl">📚</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold capitalize">
            {course.difficulty_level}
          </span>
        </div>
        {isEnrolled && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isCompleted ? 'Completed' : 'Enrolled'}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        <div className="text-xs text-[#F4E2A3] font-semibold mb-2 uppercase">
          {course.category}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 group-hover:text-[#F4E2A3] transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-3">
          By {course.instructor_id}
        </p>

        {/* Enrollment Progress */}
        {isEnrolled && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{Math.round(completionPct)}%</span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>0</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            {isEnrolled ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle className="h-4 w-4" />
                Enrolled
              </span>
            ) : course.price > 0 ? (
              <>
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg text-black">{course.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold text-lg text-green-600">FREE</span>
            )}
          </div>
          <Button
            size="sm"
            className={
              isEnrolled
                ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]'
                : 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]'
            }
            onClick={handleButtonClick}
          >
            {isEnrolled
              ? (isCompleted ? 'Review' : 'Continue Learning')
              : 'View Course'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}