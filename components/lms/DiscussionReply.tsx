import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowBigUp, MessageSquare, Edit, Trash2, Check, X } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Reply {
  id: number;
  discussion_id: number;
  parent_reply_id?: number;
  user_id: string;
  content: string;
  upvotes: number;
  is_instructor_response: boolean;
  created_at: string;
  updated_at: string;
  replies?: Reply[];
  user_has_upvoted?: boolean;
}

interface DiscussionReplyProps {
  reply: Reply;
  currentUserId: string;
  isInstructor: boolean;
  onUpdate: () => void;
  depth?: number;
}

export default function DiscussionReply({ reply, currentUserId, isInstructor, onUpdate, depth = 0 }: DiscussionReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [submitting, setSubmitting] = useState(false);

  const isAuthor = reply.user_id === currentUserId;
  const maxDepth = 2;

  const handleUpvote = async () => {
    try {
      // Check if user has already upvoted
      const existingUpvote = await client.entities.discussion_upvotes.query({
        query: { reply_id: reply.id, user_id: currentUserId }
      });

      if (existingUpvote.data.items.length > 0) {
        // Remove upvote
        await client.entities.discussion_upvotes.delete({ id: existingUpvote.data.items[0].id.toString() });
        await client.entities.discussion_replies.update({
          id: reply.id.toString(),
          data: { upvotes: reply.upvotes - 1, updated_at: new Date().toISOString() }
        });
      } else {
        // Add upvote
        await client.entities.discussion_upvotes.create({
          data: {
            reply_id: reply.id,
            user_id: currentUserId,
            created_at: new Date().toISOString()
          }
        });
        await client.entities.discussion_replies.update({
          id: reply.id.toString(),
          data: { upvotes: reply.upvotes + 1, updated_at: new Date().toISOString() }
        });
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to upvote');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await client.entities.discussion_replies.create({
        data: {
          discussion_id: reply.discussion_id,
          parent_reply_id: reply.id,
          content: replyContent.trim(),
          upvotes: 0,
          is_instructor_response: isInstructor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      // Create notification for reply author
      await client.entities.discussion_notifications.create({
        data: {
          user_id: reply.user_id,
          discussion_id: reply.discussion_id,
          reply_id: reply.id,
          notification_type: isInstructor ? 'instructor_response' : 'new_reply',
          is_read: false,
          created_at: new Date().toISOString()
        }
      });

      toast.success('Reply posted!');
      setReplyContent('');
      setShowReplyForm(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      await client.entities.discussion_replies.update({
        id: reply.id.toString(),
        data: {
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        }
      });

      toast.success('Reply updated!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update reply:', error);
      toast.error('Failed to update reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      await client.entities.discussion_replies.delete({ id: reply.id.toString() });
      toast.success('Reply deleted!');
      onUpdate();
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('Failed to delete reply');
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className={`mb-3 ${reply.is_instructor_response ? 'border-2 border-blue-200 bg-blue-50' : ''}`}>
        <CardContent className="p-4">
          {/* Reply Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">
                  {reply.user_id.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reply.user_id}</span>
                  {reply.is_instructor_response && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      Instructor
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Reply Content */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleEdit} disabled={submitting}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <MarkdownRenderer content={reply.content} />
            </div>
          )}

          {/* Reply Actions */}
          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={reply.user_has_upvoted ? 'text-[#F4E2A3]' : ''}
            >
              <ArrowBigUp className={`h-4 w-4 mr-1 ${reply.user_has_upvoted ? 'fill-current' : ''}`} />
              {reply.upvotes}
            </Button>

            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={submitting || !replyContent.trim()}
                  className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-2">
          {reply.replies.map((nestedReply) => (
            <DiscussionReply
              key={nestedReply.id}
              reply={nestedReply}
              currentUserId={currentUserId}
              isInstructor={isInstructor}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}