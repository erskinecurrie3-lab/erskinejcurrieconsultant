import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

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

interface CourseOutline {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  modules: Module[];
}

interface AICourseAssistantProps {
  open: boolean;
  onClose: () => void;
  onApply: (outline: CourseOutline) => void;
}

export default function AICourseAssistant({ open, onClose, onApply }: AICourseAssistantProps) {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<CourseOutline | null>(null);
  const [streamedText, setStreamedText] = useState('');

  const generateOutline = async () => {
    if (!topic.trim()) {
      toast.error('Please describe the course topic');
      return;
    }

    setGenerating(true);
    setStreamedText('');
    setGeneratedOutline(null);

    try {
      let fullContent = '';

      await client.ai.gentxt({
        messages: [
          {
            role: 'system',
            content: `You are an expert curriculum designer for a worship leadership training platform called "Worship Builders Collective". Generate detailed course outlines for worship ministry training.

You MUST respond with ONLY valid JSON (no markdown, no code fences, no extra text). The JSON must follow this exact structure:
{
  "title": "Course Title",
  "description": "A compelling 2-3 sentence course description",
  "category": "One of: Worship, Leadership, Theology, Team Building, Music Skills, Church Planting, Planning",
  "difficulty_level": "One of: beginner, intermediate, advanced",
  "duration_hours": number,
  "modules": [
    {
      "title": "Module Title",
      "description": "Module description",
      "order_index": 0,
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "Lesson description",
          "content": "",
          "video_url": "",
          "duration_minutes": 30,
          "order_index": 0
        }
      ]
    }
  ]
}

Generate 3-5 modules with 3-5 lessons each. Make content relevant to worship ministry and church leadership.`
          },
          {
            role: 'user',
            content: `Create a detailed course outline for: ${topic}`
          }
        ],
        model: 'deepseek-v3.2',
        stream: true,
        onChunk: (chunk) => {
          if (chunk.content) {
            fullContent += chunk.content;
            setStreamedText(fullContent);
          }
        },
        onComplete: () => {
          try {
            // Try to extract JSON from the response
            let jsonStr = fullContent.trim();
            // Remove markdown code fences if present
            const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1].trim();
            }
            // Try to find JSON object
            const startIdx = jsonStr.indexOf('{');
            const endIdx = jsonStr.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
              jsonStr = jsonStr.substring(startIdx, endIdx + 1);
            }

            const parsed = JSON.parse(jsonStr) as CourseOutline;
            setGeneratedOutline(parsed);
            toast.success('Course outline generated successfully!');
          } catch (e) {
            console.error('Failed to parse AI response:', e);
            toast.error('Failed to parse AI response. Please try again.');
          }
          setGenerating(false);
        },
        onError: (error) => {
          console.error('AI generation error:', error);
          toast.error('Failed to generate outline. Please try again.');
          setGenerating(false);
        },
        timeout: 60000
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate outline. Please try again.');
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedOutline) {
      onApply(generatedOutline);
      onClose();
      setTopic('');
      setGeneratedOutline(null);
      setStreamedText('');
      toast.success('Course outline applied!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F4E2A3]" />
            AI Course Assistant
          </DialogTitle>
          <DialogDescription>
            Describe your course topic and let AI generate a complete course outline with modules and lessons.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label>Course Topic / Description</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A comprehensive course on leading contemporary worship for beginners, covering song selection, band dynamics, and spiritual preparation..."
              rows={4}
              disabled={generating}
            />
          </div>

          <Button
            onClick={generateOutline}
            disabled={generating || !topic.trim()}
            className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Course Outline
              </>
            )}
          </Button>

          {/* Streaming Preview */}
          {generating && streamedText && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">Generating...</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{streamedText}</pre>
            </div>
          )}

          {/* Generated Outline Preview */}
          {generatedOutline && (
            <div className="border-2 border-[#F4E2A3] rounded-lg p-4 space-y-4">
              <h3 className="font-bold text-lg text-black">{generatedOutline.title}</h3>
              <p className="text-gray-600 text-sm">{generatedOutline.description}</p>

              <div className="flex gap-3 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded">{generatedOutline.category}</span>
                <span className="px-2 py-1 bg-gray-100 rounded capitalize">{generatedOutline.difficulty_level}</span>
                <span className="px-2 py-1 bg-gray-100 rounded">{generatedOutline.duration_hours}h</span>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-black">Curriculum ({generatedOutline.modules.length} modules)</h4>
                {generatedOutline.modules.map((module, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-sm text-black">{module.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                    <div className="mt-2 space-y-1">
                      {module.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-4 h-4 bg-[#F4E2A3] rounded-full flex items-center justify-center text-[10px] font-bold text-black">
                            {lIdx + 1}
                          </span>
                          <span>{lesson.title}</span>
                          {lesson.duration_minutes > 0 && (
                            <span className="text-gray-400">({lesson.duration_minutes}min)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleApply}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Apply This Outline to Course Editor
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}