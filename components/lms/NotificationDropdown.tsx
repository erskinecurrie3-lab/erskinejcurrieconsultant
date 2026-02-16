import { useState, useEffect } from 'react';
import { Bell, Check, MessageSquare, ArrowBigUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  user_id: string;
  discussion_id: number;
  reply_id?: number;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await client.entities.discussion_notifications.query({
        sort: '-created_at',
        limit: 20
      });
      setNotifications(response.data.items);
      setUnreadCount(response.data.items.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await client.entities.discussion_notifications.update({
        id: notificationId.toString(),
        data: { is_read: true }
      });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n =>
          client.entities.discussion_notifications.update({
            id: n.id.toString(),
            data: { is_read: true }
          })
        )
      );
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    // Navigate to the discussion
    // Note: We need to get the course_id from the discussion to construct the proper URL
    try {
      const discussion = await client.entities.discussions.get({ id: notification.discussion_id.toString() });
      navigate(`/lms/courses/${discussion.data.course_id}/learn`);
    } catch (error) {
      console.error('Failed to navigate to discussion:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_reply':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'instructor_response':
        return <User className="h-4 w-4 text-green-600" />;
      case 'upvote':
        return <ArrowBigUp className="h-4 w-4 text-[#F4E2A3]" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationText = (type: string) => {
    switch (type) {
      case 'new_reply':
        return 'New reply to your discussion';
      case 'instructor_response':
        return 'Instructor responded to your discussion';
      case 'upvote':
        return 'Someone upvoted your discussion';
      default:
        return 'New notification';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={loading}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-3 py-2">
                  <div className="mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getNotificationText(notification.notification_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}