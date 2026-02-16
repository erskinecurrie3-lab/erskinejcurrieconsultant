import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LessonEditor from './LessonEditor';
import { ChevronDown, ChevronUp, GripVertical, Trash2, Plus } from 'lucide-react';

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

interface ModuleEditorProps {
  module: Module;
  onUpdate: (module: Module) => void;
  onDelete: () => void;
  dragHandleProps?: any;
  courseTitle?: string;
}

export default function ModuleEditor({ module, onUpdate, onDelete, dragHandleProps, courseTitle }: ModuleEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (field: keyof Module, value: any) => {
    onUpdate({ ...module, [field]: value });
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: 0,
      order_index: module.lessons.length
    };
    onUpdate({ ...module, lessons: [...module.lessons, newLesson] });
  };

  const updateLesson = (index: number, updatedLesson: Lesson) => {
    const newLessons = [...module.lessons];
    newLessons[index] = updatedLesson;
    onUpdate({ ...module, lessons: newLessons });
  };

  const deleteLesson = (index: number) => {
    const newLessons = module.lessons.filter((_, i) => i !== index);
    onUpdate({ ...module, lessons: newLessons });
  };

  return (
    <Card className="mb-4 border-2 border-[#F4E2A3]">
      <CardHeader className="bg-[#F4E2A3] bg-opacity-20">
        <div className="flex items-center gap-3">
          <div {...dragHandleProps} className="cursor-move">
            <GripVertical className="h-6 w-6 text-gray-600" />
          </div>
          
          <div className="flex-1">
            {isExpanded ? (
              <div className="space-y-2">
                <Input
                  value={module.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Module title"
                  className="font-semibold text-lg"
                />
                <Textarea
                  value={module.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Module description"
                  rows={2}
                />
              </div>
            ) : (
              <CardTitle className="text-lg">
                {module.title || 'Untitled Module'}
                <span className="text-sm text-gray-500 ml-2">
                  ({module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'})
                </span>
              </CardTitle>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-6">
          {/* Lessons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Lessons</Label>
              <Button
                type="button"
                onClick={addLesson}
                size="sm"
                className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            {module.lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>No lessons yet. Click "Add Lesson" to create one.</p>
              </div>
            ) : (
              module.lessons.map((lesson, index) => (
                <LessonEditor
                  key={index}
                  lesson={lesson}
                  onUpdate={(updatedLesson) => updateLesson(index, updatedLesson)}
                  onDelete={() => deleteLesson(index)}
                  courseTitle={courseTitle}
                  moduleTitle={module.title}
                />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}