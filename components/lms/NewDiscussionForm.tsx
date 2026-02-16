import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquarePlus } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface NewDiscussionFormProps {
  courseId: number;
  lessonId?: number;
  onSuccess: () => void;
}

export default function NewDiscussionForm({ courseId, lessonId, onSuccess }: NewDiscussionFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const discussionData: Record<string, any> = {
        course_id: courseId,
        title: title.trim(),
        content: content.trim(),
        is_pinned: false,
        is_resolved: false,
        upvotes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Only include lesson_id if it's a valid number
      if (lessonId && lessonId > 0) {
        discussionData.lesson_id = lessonId;
      } else {
        discussionData.lesson_id = 0;
      }

      await client.entities.discussions.create({
        data: discussionData
      });

      toast.success('Discussion posted successfully!');
      setTitle('');
      setContent('');
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to create discussion:', error);
      toast.error('Failed to post discussion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">{title.length}/200 characters</p>
          </div>

          <div className="space-y-2">
            <Label>Content * (Markdown supported)</Label>
            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about your question..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>Markdown tips:</strong></p>
                  <p>**bold** | *italic* | `code` | [link](url) | # Heading</p>
                  <p>- List item | 1. Numbered list | &gt; Quote | ```code block```</p>
                </div>
              </TabsContent>
              <TabsContent value="preview">
                <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[240px]">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-gray-400 italic">Nothing to preview</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}