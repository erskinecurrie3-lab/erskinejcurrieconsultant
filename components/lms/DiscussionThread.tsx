import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowBigUp, 
  MessageSquare, 
  Pin, 
  CheckCircle, 
  Edit, 
  Trash2,
  Check,
  X
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import DiscussionReply from './DiscussionReply';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Discussion {
  id: number;
  course_id: number;
  lesson_id?: number;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_resolved: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  reply_count?: number;
  user_has_upvoted?: boolean;
}

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
}

interface DiscussionThreadProps {
  discussion: Discussion;
  currentUserId: string;
  isInstructor: boolean;
  onUpdate: () => void;
  onClose?: () => void;
}

export default function DiscussionThread({ discussion, currentUserId, isInstructor, onUpdate, onClose }: DiscussionThreadProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(discussion.title);
  const [editContent, setEditContent] = useState(discussion.content);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAuthor = discussion.user_id === currentUserId;

  useEffect(() => {
    loadReplies();
  }, [discussion.id]);

  const loadReplies = async () => {
    try {
      const response = await client.entities.discussion_replies.query({
        query: { discussion_id: discussion.id },
        sort: 'created_at'
      });

      // Build threaded structure
      const repliesMap = new Map<number, Reply>();
      const rootReplies: Reply[] = [];

      response.data.items.forEach((reply: Reply) => {
        repliesMap.set(reply.id, { ...reply, replies: [] });
      });

      response.data.items.forEach((reply: Reply) => {
        const replyObj = repliesMap.get(reply.id)!;
        if (reply.parent_reply_id) {
          const parent = repliesMap.get(reply.parent_reply_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(replyObj);
          }
        } else {
          rootReplies.push(replyObj);
        }
      });

      setReplies(rootReplies);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const existingUpvote = await client.entities.discussion_upvotes.query({
        query: { discussion_id: discussion.id, user_id: currentUserId }
      });

      if (existingUpvote.data.items.length > 0) {
        await client.entities.discussion_upvotes.delete({ id: existingUpvote.data.items[0].id.toString() });
        await client.entities.discussions.update({
          id: discussion.id.toString(),
          data: { upvotes: discussion.upvotes - 1, updated_at: new Date().toISOString() }
        });
      } else {
        await client.entities.discussion_upvotes.create({
          data: {
            discussion_id: discussion.id,
            user_id: currentUserId,
            created_at: new Date().toISOString()
          }
        });
        await client.entities.discussions.update({
          id: discussion.id.toString(),
          data: { upvotes: discussion.upvotes + 1, updated_at: new Date().toISOString() }
        });
      }
      onUpdate();
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to upvote');
    }
  };

  const handlePin = async () => {
    try {
      await client.entities.discussions.update({
        id: discussion.id.toString(),
        data: {
          is_pinned: !discussion.is_pinned,
          updated_at: new Date().toISOString()
        }
      });
      toast.success(discussion.is_pinned ? 'Discussion unpinned' : 'Discussion pinned');
      onUpdate();
    } catch (error) {
      console.error('Failed to pin discussion:', error);
      toast.error('Failed to pin discussion');
    }
  };

  const handleResolve = async () => {
    try {
      await client.entities.discussions.update({
        id: discussion.id.toString(),
        data: {
          is_resolved: !discussion.is_resolved,
          updated_at: new Date().toISOString()
        }
      });
      toast.success(discussion.is_resolved ? 'Discussion reopened' : 'Discussion marked as resolved');
      onUpdate();
    } catch (error) {
      console.error('Failed to resolve discussion:', error);
      toast.error('Failed to resolve discussion');
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    setSubmitting(true);
    try {
      await client.entities.discussions.update({
        id: discussion.id.toString(),
        data: {
          title: editTitle.trim(),
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        }
      });
      toast.success('Discussion updated!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update discussion:', error);
      toast.error('Failed to update discussion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    try {
      await client.entities.discussions.delete({ id: discussion.id.toString() });
      toast.success('Discussion deleted!');
      onUpdate();
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to delete discussion:', error);
      toast.error('Failed to delete discussion');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await client.entities.discussion_replies.create({
        data: {
          discussion_id: discussion.id,
          content: replyContent.trim(),
          upvotes: 0,
          is_instructor_response: isInstructor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      // Create notification for discussion author
      await client.entities.discussion_notifications.create({
        data: {
          user_id: discussion.user_id,
          discussion_id: discussion.id,
          notification_type: isInstructor ? 'instructor_response' : 'new_reply',
          is_read: false,
          created_at: new Date().toISOString()
        }
      });

      toast.success('Reply posted!');
      setReplyContent('');
      loadReplies();
      onUpdate();
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Discussion */}
      <Card className={`${discussion.is_pinned ? 'border-2 border-[#F4E2A3]' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold border-2 border-gray-200 rounded px-2 py-1"
                />
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{discussion.title}</h2>
                  {discussion.is_pinned && (
                    <Pin className="h-5 w-5 text-[#F4E2A3] fill-current" />
                  )}
                  {discussion.is_resolved && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Resolved
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">
                      {discussion.user_id.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{discussion.user_id}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isAuthor || isInstructor) && (
                <>
                  {isInstructor && (
                    <Button variant="ghost" size="sm" onClick={handlePin}>
                      <Pin className={`h-4 w-4 ${discussion.is_pinned ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                  {(isAuthor || isInstructor) && (
                    <Button variant="ghost" size="sm" onClick={handleResolve}>
                      <CheckCircle className={`h-4 w-4 ${discussion.is_resolved ? 'fill-current text-green-600' : ''}`} />
                    </Button>
                  )}
                  {isAuthor && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleEdit} disabled={submitting}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <MarkdownRenderer content={discussion.content} />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpvote}
                  className={discussion.user_has_upvoted ? 'text-[#F4E2A3]' : ''}
                >
                  <ArrowBigUp className={`h-5 w-5 mr-1 ${discussion.user_has_upvoted ? 'fill-current' : ''}`} />
                  {discussion.upvotes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-5 w-5 mr-1" />
                  {replies.length}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading replies...</div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <DiscussionReply
              key={reply.id}
              reply={reply}
              currentUserId={currentUserId}
              isInstructor={isInstructor}
              onUpdate={() => {
                loadReplies();
                onUpdate();
              }}
            />
          ))}
        </div>
      )}

      {/* Add Reply Form */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Add a Reply</h3>
          <div className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts or answer..."
              rows={4}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleReply}
              disabled={submitting || !replyContent.trim()}
              className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
            >
              {submitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}