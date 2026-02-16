import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from './RichTextEditor';
import AIContentGenerator from './AIContentGenerator';
import { ChevronDown, ChevronUp, GripVertical, Trash2, Video } from 'lucide-react';

interface Lesson {
  id?: number;
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
  onDelete: () => void;
  dragHandleProps?: any;
  courseTitle?: string;
  moduleTitle?: string;
}

export default function LessonEditor({ lesson, onUpdate, onDelete, dragHandleProps, courseTitle, moduleTitle }: LessonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof Lesson, value: any) => {
    onUpdate({ ...lesson, [field]: value });
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        {/* Collapsed View */}
        <div className="flex items-center gap-3">
          <div {...dragHandleProps} className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="font-medium text-black">{lesson.title || 'Untitled Lesson'}</div>
            {lesson.duration_minutes > 0 && (
              <div className="text-sm text-gray-500">{lesson.duration_minutes} minutes</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {lesson.video_url && (
              <Video className="h-4 w-4 text-blue-600" />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Lesson Title *</Label>
              <Input
                value={lesson.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={lesson.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this lesson"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                type="url"
                value={lesson.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="YouTube URL or direct video link"
              />
              {lesson.video_url && (
                <div className="text-sm text-gray-500">
                  {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be')
                    ? '✓ YouTube video detected'
                    : '✓ Direct video link'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={lesson.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lesson Content</Label>
                <AIContentGenerator
                  type="lesson"
                  context={{
                    courseTitle: courseTitle,
                    moduleTitle: moduleTitle,
                    lessonTitle: lesson.title,
                    existingContent: lesson.description
                  }}
                  onGenerated={(content) => handleChange('content', content)}
                />
              </div>
              <RichTextEditor
                content={lesson.content}
                onChange={(content) => handleChange('content', content)}
                placeholder="Enter lesson content, instructions, and resources..."
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}