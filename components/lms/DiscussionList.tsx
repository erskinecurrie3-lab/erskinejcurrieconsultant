import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ArrowBigUp, 
  MessageSquare, 
  Pin, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NewDiscussionForm from './NewDiscussionForm';
import DiscussionThread from './DiscussionThread';

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
}

interface DiscussionListProps {
  courseId: number;
  lessonId?: number;
  currentUserId: string;
  isInstructor: boolean;
}

export default function DiscussionList({ courseId, lessonId, currentUserId, isInstructor }: DiscussionListProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unresolved' | 'mine' | 'instructor'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'replies'>('newest');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  useEffect(() => {
    loadDiscussions();
  }, [courseId, lessonId, filterType, sortBy]);

  const loadDiscussions = async () => {
    setLoading(true);
    try {
      const query: any = { course_id: courseId };
      
      if (lessonId) {
        query.lesson_id = lessonId;
      }

      if (filterType === 'unresolved') {
        query.is_resolved = false;
      } else if (filterType === 'mine') {
        query.user_id = currentUserId;
      }

      let sort = '-created_at';
      if (sortBy === 'popular') {
        sort = '-upvotes';
      }

      const response = await client.entities.discussions.query({
        query,
        sort,
        limit: 100
      });

      // Get reply counts for each discussion
      const discussionsWithCounts = await Promise.all(
        response.data.items.map(async (discussion: Discussion) => {
          const repliesResponse = await client.entities.discussion_replies.query({
            query: { discussion_id: discussion.id }
          });
          return {
            ...discussion,
            reply_count: repliesResponse.data.items.length
          };
        })
      );

      // Sort pinned discussions to top
      const sorted = discussionsWithCounts.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });

      setDiscussions(sorted);
    } catch (error) {
      console.error('Failed to load discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    if (searchQuery === '') return true;
    return (
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (selectedDiscussion) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setSelectedDiscussion(null)}
          className="mb-4"
        >
          ← Back to Discussions
        </Button>
        <DiscussionThread
          discussion={selectedDiscussion}
          currentUserId={currentUserId}
          isInstructor={isInstructor}
          onUpdate={() => {
            loadDiscussions();
            setSelectedDiscussion(null);
          }}
          onClose={() => setSelectedDiscussion(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {lessonId ? 'Lesson Discussions' : 'Course Discussions'}
        </h2>
        <NewDiscussionForm
          courseId={courseId}
          lessonId={lessonId}
          onSuccess={loadDiscussions}
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3]"
              >
                <option value="all">All Discussions</option>
                <option value="unresolved">Unresolved</option>
                <option value="mine">My Questions</option>
                {isInstructor && <option value="instructor">Instructor Responses</option>}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border-2 border-gray-200 rounded-md focus:outline-none focus:border-[#F4E2A3]"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="replies">Most Replies</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discussion List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-600 mb-4">Be the first to ask a question or start a discussion!</p>
            <NewDiscussionForm
              courseId={courseId}
              lessonId={lessonId}
              onSuccess={loadDiscussions}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDiscussions.map((discussion) => (
            <Card
              key={discussion.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                discussion.is_pinned ? 'border-2 border-[#F4E2A3]' : ''
              }`}
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Vote Count */}
                  <div className="flex flex-col items-center gap-1 text-gray-600">
                    <ArrowBigUp className="h-5 w-5" />
                    <span className="text-sm font-medium">{discussion.upvotes}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{discussion.title}</h3>
                        {discussion.is_pinned && (
                          <Pin className="h-4 w-4 text-[#F4E2A3] fill-current" />
                        )}
                        {discussion.is_resolved && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {discussion.content.substring(0, 200)}...
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#F4E2A3] rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-black">
                            {discussion.user_id.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{discussion.user_id}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.reply_count || 0} {discussion.reply_count === 1 ? 'reply' : 'replies'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}