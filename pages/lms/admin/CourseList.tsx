import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';

interface Course {
  id: number;
  title: string;
  category: string;
  difficulty_level: string;
  is_published: boolean;
  price: number;
  created_at: string;
}

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await client.entities.courses.queryAll({
        sort: '-created_at',
        limit: 100
      });
      setCourses(response.data.items);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await client.entities.courses.delete({ id: id.toString() });
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && course.is_published) ||
      (filterStatus === 'draft' && !course.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Leadership', 'Team Building', 'Planning', 'Music Skills', 'Church Planting'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Course Management</h1>
          <p className="text-gray-600">Create and manage your training courses</p>
        </div>
        <Button 
          className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
          onClick={() => navigate('/lms/admin/courses/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Course Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>Manage your course catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No courses found</p>
              <p className="text-sm">Create your first course to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-[#F4E2A3]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Enrollments</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-black">{course.title}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{course.category}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                          {course.difficulty_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ${course.price ? course.price.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={course.is_published ? 'published' : 'draft'} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="h-4 w-4 mr-1" />
                          0
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/lms/courses/${course.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/lms/admin/courses/${course.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}