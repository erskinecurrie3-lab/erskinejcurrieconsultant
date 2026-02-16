import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface AIContentGeneratorProps {
  type: 'lesson' | 'description';
  context: {
    courseTitle?: string;
    moduleTitle?: string;
    lessonTitle?: string;
    existingContent?: string;
  };
  onGenerated: (content: string) => void;
  buttonLabel?: string;
  className?: string;
}

export default function AIContentGenerator({
  type,
  context,
  onGenerated,
  buttonLabel,
  className = ''
}: AIContentGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    let fullContent = '';

    const systemPrompt = type === 'lesson'
      ? `You are an expert curriculum content writer for "Worship Builders Collective", a worship leadership training platform. Write detailed, engaging lesson content in HTML format. Include:
- Clear learning objectives at the start
- Well-structured content with headings (h2, h3)
- Practical examples and applications for worship ministry
- Key takeaways or reflection questions at the end
- Use <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em> tags
Keep content between 500-800 words. Make it practical and applicable to worship leaders.`
      : `You are an expert course description writer for "Worship Builders Collective". Write a compelling, professional course description in HTML format that:
- Hooks the reader in the first sentence
- Clearly states what students will learn
- Highlights practical outcomes
- Uses 2-3 short paragraphs
- Uses <p> and <strong> tags
Keep it under 150 words.`;

    const userPrompt = type === 'lesson'
      ? `Write lesson content for:
Course: ${context.courseTitle || 'Worship Leadership'}
Module: ${context.moduleTitle || 'General'}
Lesson: ${context.lessonTitle || 'Untitled Lesson'}
${context.existingContent ? `\nExisting description: ${context.existingContent}` : ''}`
      : `Write a course description for: ${context.courseTitle || 'Untitled Course'}
${context.existingContent ? `\nExisting description: ${context.existingContent}` : ''}`;

    try {
      await client.ai.gentxt({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'deepseek-v3.2',
        stream: true,
        onChunk: (chunk) => {
          if (chunk.content) {
            fullContent += chunk.content;
          }
        },
        onComplete: () => {
          // Clean up any markdown code fences
          let cleaned = fullContent.trim();
          const htmlMatch = cleaned.match(/```(?:html)?\s*([\s\S]*?)```/);
          if (htmlMatch) {
            cleaned = htmlMatch[1].trim();
          }
          onGenerated(cleaned);
          toast.success('Content generated!');
          setGenerating(false);
        },
        onError: (error) => {
          console.error('AI generation error:', error);
          toast.error('Failed to generate content');
          setGenerating(false);
        },
        timeout: 60000
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content');
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={generate}
      disabled={generating}
      className={`border-[#F4E2A3] text-black hover:bg-[#F4E2A3] ${className}`}
    >
      {generating ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3 mr-1" />
          {buttonLabel || (type === 'lesson' ? 'AI Generate Content' : 'AI Write Description')}
        </>
      )}
    </Button>
  );
}