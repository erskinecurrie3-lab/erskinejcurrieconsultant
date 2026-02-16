import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/lms/RichTextEditor';
import ModuleEditor from '@/components/lms/ModuleEditor';
import AICourseAssistant from '@/components/lms/AICourseAssistant';
import AIContentGenerator from '@/components/lms/AIContentGenerator';
import { Plus, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Lesson {
  id?: number;
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface Module {
  id?: number;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseData {
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  price: number;
  is_published: boolean;
  modules: Module[];
}

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    thumbnail_url: '',
    category: 'Leadership',
    difficulty_level: 'beginner',
    duration_hours: 0,
    price: 0,
    is_published: false,
    modules: []
  });

  const categories = ['Leadership', 'Team Building', 'Planning', 'Music Skills', 'Church Planting', 'Worship', 'Theology'];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const response = await client.entities.courses.get({ id: id! });
      const course = response.data;
      
      const modulesResponse = await client.entities.modules.query({
        query: { course_id: parseInt(id!) },
        sort: 'order_index'
      });
      
      const modules = await Promise.all(
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

      setCourseData({
        title: course.title,
        description: course.description || '',
        thumbnail_url: course.thumbnail_url || '',
        category: course.category || 'Leadership',
        difficulty_level: course.difficulty_level || 'beginner',
        duration_hours: course.duration_hours || 0,
        price: course.price || 0,
        is_published: course.is_published || false,
        modules: modules
      });
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CourseData, value: any) => {
    setCourseData({ ...courseData, [field]: value });
  };

  const addModule = () => {
    const newModule: Module = {
      title: '',
      description: '',
      order_index: courseData.modules.length,
      lessons: []
    };
    setCourseData({ ...courseData, modules: [...courseData.modules, newModule] });
  };

  const updateModule = (index: number, updatedModule: Module) => {
    const newModules = [...courseData.modules];
    newModules[index] = updatedModule;
    setCourseData({ ...courseData, modules: newModules });
  };

  const deleteModule = (index: number) => {
    const newModules = courseData.modules.filter((_, i) => i !== index);
    setCourseData({ ...courseData, modules: newModules });
  };

  const handleAIOutlineApply = (outline: any) => {
    setCourseData({
      ...courseData,
      title: outline.title || courseData.title,
      description: outline.description || courseData.description,
      category: outline.category || courseData.category,
      difficulty_level: outline.difficulty_level || courseData.difficulty_level,
      duration_hours: outline.duration_hours || courseData.duration_hours,
      modules: outline.modules || courseData.modules
    });
  };

  const handleSave = async () => {
    if (!courseData.title) {
      toast.error('Please enter a course title');
      return;
    }

    setSaving(true);
    try {
      let courseId = id;

      if (id) {
        await client.entities.courses.update({
          id: id,
          data: {
            title: courseData.title,
            description: courseData.description,
            thumbnail_url: courseData.thumbnail_url,
            category: courseData.category,
            difficulty_level: courseData.difficulty_level,
            duration_hours: courseData.duration_hours,
            price: courseData.price,
            is_published: courseData.is_published,
            updated_at: new Date().toISOString()
          }
        });
      } else {
        const response = await client.entities.courses.create({
          data: {
            title: courseData.title,
            description: courseData.description,
            thumbnail_url: courseData.thumbnail_url,
            instructor_id: 'admin',
            category: courseData.category,
            difficulty_level: courseData.difficulty_level,
            duration_hours: courseData.duration_hours,
            price: courseData.price,
            is_published: courseData.is_published,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
        courseId = response.data.id.toString();
      }

      for (let i = 0; i < courseData.modules.length; i++) {
        const module = courseData.modules[i];
        let moduleId = module.id;

        if (moduleId) {
          await client.entities.modules.update({
            id: moduleId.toString(),
            data: {
              title: module.title,
              description: module.description,
              order_index: i,
              updated_at: new Date().toISOString()
            }
          });
        } else {
          const moduleResponse = await client.entities.modules.create({
            data: {
              course_id: parseInt(courseId!),
              title: module.title,
              description: module.description,
              order_index: i,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          });
          moduleId = moduleResponse.data.id;
        }

        for (let j = 0; j < module.lessons.length; j++) {
          const lesson = module.lessons[j];
          if (lesson.id) {
            await client.entities.lessons.update({
              id: lesson.id.toString(),
              data: {
                title: lesson.title,
                description: lesson.description,
                content: lesson.content,
                video_url: lesson.video_url,
                duration_minutes: lesson.duration_minutes,
                order_index: j,
                updated_at: new Date().toISOString()
              }
            });
          } else {
            await client.entities.lessons.create({
              data: {
                module_id: moduleId,
                title: lesson.title,
                description: lesson.description,
                content: lesson.content,
                video_url: lesson.video_url,
                duration_minutes: lesson.duration_minutes,
                order_index: j,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            });
          }
        }
      }

      toast.success(id ? 'Course updated successfully' : 'Course created successfully');
      navigate('/lms/admin/courses');
    } catch (error) {
      console.error('Failed to save course:', error);
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/lms/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-black">
            {id ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAIAssistant(true)}
            className="border-[#F4E2A3] text-black hover:bg-[#F4E2A3]"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assist
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={courseData.is_published}
              onCheckedChange={(checked) => handleChange('is_published', checked)}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Course
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Course Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                type="url"
                value={courseData.thumbnail_url}
                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                placeholder="/images/CourseThumbnail.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <AIContentGenerator
                type="description"
                context={{ courseTitle: courseData.title, existingContent: courseData.description }}
                onGenerated={(content) => handleChange('description', content)}
              />
            </div>
            <RichTextEditor
              content={courseData.description}
              onChange={(content) => handleChange('description', content)}
              placeholder="Enter course description..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={courseData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={courseData.difficulty_level}
                onChange={(e) => handleChange('difficulty_level', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3] capitalize"
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level} className="capitalize">{level}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={courseData.duration_hours}
                onChange={(e) => handleChange('duration_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={courseData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <p className="text-sm text-gray-500">Set to 0 for free courses</p>
          </div>
        </CardContent>
      </Card>

      {/* Modules & Lessons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Curriculum</CardTitle>
            <Button
              type="button"
              onClick={addModule}
              className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courseData.modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Sparkles className="h-12 w-12 text-[#F4E2A3] mx-auto mb-3" />
              <p className="text-lg font-medium mb-2">No modules yet</p>
              <p className="text-sm mb-4">Click &quot;Add Module&quot; to create manually, or use AI Assist to generate a full outline</p>
              <Button
                variant="outline"
                onClick={() => setShowAIAssistant(true)}
                className="border-[#F4E2A3] text-black hover:bg-[#F4E2A3]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {courseData.modules.map((module, index) => (
                <ModuleEditor
                  key={index}
                  module={module}
                  onUpdate={(updatedModule) => updateModule(index, updatedModule)}
                  onDelete={() => deleteModule(index)}
                  courseTitle={courseData.title}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Course Assistant Dialog */}
      <AICourseAssistant
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onApply={handleAIOutlineApply}
      />
    </div>
  );
}