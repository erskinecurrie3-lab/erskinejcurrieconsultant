import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, User, Shield, Palette } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface EmailPreferences {
  email_on_reply: boolean;
  email_on_instructor_response: boolean;
  email_on_upvote: boolean;
  email_on_mention: boolean;
  digest_frequency: string;
}

export default function UnifiedSettings() {
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences>({
    email_on_reply: true,
    email_on_instructor_response: true,
    email_on_upvote: false,
    email_on_mention: true,
    digest_frequency: 'instant'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmailPreferences();
  }, []);

  const loadEmailPreferences = async () => {
    setLoading(true);
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/email-preferences',
        method: 'GET'
      });
      if (response.data) {
        setEmailPreferences(response.data);
      }
    } catch (error) {
      console.error('Failed to load email preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEmailPreferences = async () => {
    setSaving(true);
    try {
      await client.apiCall.invoke({
        url: '/api/v1/email-preferences',
        method: 'PUT',
        data: emailPreferences
      });
      toast.success('Email preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      toast.error('Failed to save email preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications within the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications for important updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-gray-500">Show desktop notifications when browser is open</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading preferences...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Replies</Label>
                      <p className="text-sm text-gray-500">Get notified when someone replies to your discussions</p>
                    </div>
                    <Switch
                      checked={emailPreferences.email_on_reply}
                      onCheckedChange={(checked) =>
                        setEmailPreferences({ ...emailPreferences, email_on_reply: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Instructor Responses</Label>
                      <p className="text-sm text-gray-500">Get notified when an instructor responds to your questions</p>
                    </div>
                    <Switch
                      checked={emailPreferences.email_on_instructor_response}
                      onCheckedChange={(checked) =>
                        setEmailPreferences({ ...emailPreferences, email_on_instructor_response: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Upvotes</Label>
                      <p className="text-sm text-gray-500">Get notified when someone upvotes your posts</p>
                    </div>
                    <Switch
                      checked={emailPreferences.email_on_upvote}
                      onCheckedChange={(checked) =>
                        setEmailPreferences({ ...emailPreferences, email_on_upvote: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mentions</Label>
                      <p className="text-sm text-gray-500">Get notified when someone mentions you in a discussion</p>
                    </div>
                    <Switch
                      checked={emailPreferences.email_on_mention}
                      onCheckedChange={(checked) =>
                        setEmailPreferences({ ...emailPreferences, email_on_mention: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Email Frequency</Label>
                    <Select
                      value={emailPreferences.digest_frequency}
                      onValueChange={(value) =>
                        setEmailPreferences({ ...emailPreferences, digest_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant (Send immediately)</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      {emailPreferences.digest_frequency === 'instant' && 'Receive emails immediately when notifications occur'}
                      {emailPreferences.digest_frequency === 'hourly' && 'Receive a summary of notifications every hour'}
                      {emailPreferences.digest_frequency === 'daily' && 'Receive a daily summary of all notifications'}
                      {emailPreferences.digest_frequency === 'weekly' && 'Receive a weekly summary of all notifications'}
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={saveEmailPreferences}
                      disabled={saving}
                      className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                    >
                      {saving ? 'Saving...' : 'Save Email Preferences'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself" />
              </div>
              <Button className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Activity Status</Label>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-gray-500">Allow collection of usage data for improvement</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the platform looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}