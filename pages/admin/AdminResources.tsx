import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Lock,
  FileText,
  Search,
  ImageIcon,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUpload from '@/components/ui/FileUpload';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/api';
import type { Resource } from '@/lib/types';
import { toast } from 'sonner';

interface ResourceFormData {
  title: string;
  description: string;
  category: string;
  topic: string;
  audience: string;
  tags: string;
  is_gated: boolean;
  file_url: string;
  thumbnail_url: string;
}

const emptyForm: ResourceFormData = {
  title: '',
  description: '',
  category: 'guide',
  topic: '',
  audience: '',
  tags: '',
  is_gated: false,
  file_url: '',
  thumbnail_url: '',
};

export default function AdminResources() {
  const { user, loading: authLoading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadResources();
    }
  }, [authLoading, user]);

  const loadResources = async () => {
    try {
      const response = await client.entities.resources.query({
        sort: '-created_at',
        limit: 200,
      });
      setResources(response.data.items);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingResource(null);
    setFormData(emptyForm);
    setShowFormDialog(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      topic: resource.topic || '',
      audience: resource.audience || '',
      tags: resource.tags || '',
      is_gated: resource.is_gated,
      file_url: resource.file_url || '',
      thumbnail_url: resource.thumbnail_url || '',
    });
    setShowFormDialog(true);
  };

  const handleDeleteClick = (resource: Resource) => {
    setDeletingResource(resource);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingResource) return;
    try {
      await client.entities.resources.delete({ id: deletingResource.id.toString() });
      toast.success('Resource deleted successfully');
      setShowDeleteDialog(false);
      setDeletingResource(null);
      loadResources();
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        topic: formData.topic,
        audience: formData.audience,
        tags: formData.tags,
        is_gated: formData.is_gated,
        file_url: formData.file_url,
        thumbnail_url: formData.thumbnail_url,
      };

      if (editingResource) {
        await client.entities.resources.update({
          id: editingResource.id.toString(),
          data: payload,
        });
        toast.success('Resource updated successfully');
      } else {
        await client.entities.resources.create({
          data: { ...payload, downloads: 0 },
        });
        toast.success('Resource created successfully');
      }

      setShowFormDialog(false);
      setFormData(emptyForm);
      setEditingResource(null);
      loadResources();
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUploadComplete = (downloadUrl: string) => {
    setFormData((prev) => ({ ...prev, file_url: downloadUrl }));
  };

  const handleThumbnailUploadComplete = (downloadUrl: string) => {
    setFormData((prev) => ({ ...prev, thumbnail_url: downloadUrl }));
  };

  const filteredResources = resources.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.topic?.toLowerCase().includes(q) ||
      r.audience?.toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ebook: 'bg-purple-100 text-purple-800',
      guide: 'bg-blue-100 text-blue-800',
      template: 'bg-green-100 text-green-800',
      checklist: 'bg-orange-100 text-orange-800',
      video: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access resource management.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]" onClick={() => client.auth.toLogin()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Resource Management</h1>
          <p className="text-gray-600">Create, edit, and manage downloadable resources</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-2 border-[#F4E2A3]">
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-black">{resources.length}</div>
            <p className="text-xs text-gray-500">Total Resources</p>
          </CardContent>
        </Card>
        {['ebook', 'guide', 'template', 'checklist'].map((cat) => (
          <Card key={cat}>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-black">
                {resources.filter((r) => r.category === cat).length}
              </div>
              <p className="text-xs text-gray-500 capitalize">{cat}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Resources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Thumb</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Topic</TableHead>
                <TableHead className="hidden md:table-cell">Audience</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
                <TableHead className="text-center">Gated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((resource) => (
                  <TableRow key={resource.id} className="hover:bg-gray-50">
                    <TableCell>
                      {resource.thumbnail_url ? (
                        <img
                          src={resource.thumbnail_url}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-black">{resource.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{resource.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(resource.category)}>
                        {resource.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600 capitalize">
                      {resource.topic || '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600 capitalize">
                      {resource.audience || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Download className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium">{resource.downloads || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {resource.is_gated ? (
                        <Lock className="h-4 w-4 text-[#B8A44E] mx-auto" />
                      ) : (
                        <span className="text-gray-400 text-xs">Free</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(resource)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(resource)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-black">
              {editingResource ? 'Edit Resource' : 'Create New Resource'}
            </DialogTitle>
            <DialogDescription>
              {editingResource
                ? 'Update the resource details below.'
                : 'Fill in the details to create a new downloadable resource.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Title *</Label>
              <Input
                id="form-title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Resource title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of the resource"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="ebook">eBook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-topic">Topic</Label>
                <Input
                  id="form-topic"
                  value={formData.topic}
                  onChange={(e) => setFormData((p) => ({ ...p, topic: e.target.value }))}
                  placeholder="e.g., church planting"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-audience">Audience</Label>
                <Input
                  id="form-audience"
                  value={formData.audience}
                  onChange={(e) => setFormData((p) => ({ ...p, audience: e.target.value }))}
                  placeholder="e.g., pastors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-tags">Tags (comma-separated)</Label>
                <Input
                  id="form-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            {/* Thumbnail Image Upload */}
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <FileUpload
                bucketName="resources"
                currentFileUrl={editingResource ? formData.thumbnail_url : undefined}
                onUploadComplete={handleThumbnailUploadComplete}
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={10}
                imagePreview
              />
            </div>

            {/* Resource File Upload */}
            <div className="space-y-2">
              <Label>Resource File</Label>
              <FileUpload
                bucketName="resources"
                currentFileUrl={editingResource ? formData.file_url : undefined}
                onUploadComplete={handleFileUploadComplete}
                accept=".pdf,.doc,.docx,.html,.txt,.pptx,.xlsx,.csv,.zip"
                maxSizeMB={50}
              />
            </div>

            <div className="flex items-center space-x-3 py-2">
              <Switch
                id="form-gated"
                checked={formData.is_gated}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_gated: checked }))}
              />
              <Label htmlFor="form-gated" className="cursor-pointer">
                Gated Resource (requires email to download)
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : editingResource ? (
                  'Update Resource'
                ) : (
                  'Create Resource'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingResource?.title}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}