import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  Video, 
  BookOpen, 
  CheckSquare, 
  FileSpreadsheet,
  Search,
  Lock,
  Eye,
  TrendingUp,
  Tag,
  Loader2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/api';
import type { Resource } from '@/lib/types';
import { toast } from 'sonner';

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showGateModal, setShowGateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [emailCapture, setEmailCapture] = useState({
    name: '',
    email: '',
    church_name: '',
    role: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await client.entities.resources.query({
        sort: '-downloads',
        limit: 100
      });
      setResources(response.data.items);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      guide: FileText,
      template: FileSpreadsheet,
      checklist: CheckSquare,
      video: Video,
      ebook: BookOpen
    };
    return icons[category] || FileText;
  };

  const logDownload = async (resource: Resource, source: 'direct' | 'gated', email: string) => {
    try {
      await client.entities.resource_downloads.create({
        data: {
          resource_id: resource.id,
          resource_title: resource.title,
          user_email: email,
          download_timestamp: new Date().toISOString(),
          source
        }
      });
    } catch (error) {
      console.error('Failed to log download:', error);
    }
  };

  const generatePdfAndDownload = async (resource: Resource) => {
    if (!resource.file_url) {
      toast.error('Download file not available');
      return;
    }

    setDownloadingId(resource.id);
    try {
      // Fetch the HTML content
      const response = await fetch(resource.file_url);
      const htmlContent = await response.text();

      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.width = '800px';
      container.style.padding = '20px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Dynamically import html2pdf.js
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      const filename = resource.title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-') + '.pdf';

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(container)
        .save();

      // Clean up
      document.body.removeChild(container);
      toast.success('PDF download started!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to HTML download
      if (resource.file_url) {
        const link = document.createElement('a');
        link.href = resource.file_url;
        link.download = resource.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') + '.html';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info('Downloaded as HTML (PDF generation unavailable)');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownload = async (resource: Resource) => {
    // Check if resource is gated
    if (resource.is_gated && !user) {
      setSelectedResource(resource);
      setShowGateModal(true);
      return;
    }

    // Track download count
    try {
      await client.entities.resources.update({
        id: resource.id.toString(),
        data: {
          downloads: (resource.downloads || 0) + 1
        }
      });

      // Log download event
      const userEmail = user?.email || 'anonymous';
      await logDownload(resource, 'direct', userEmail);

      // Generate PDF and download
      await generatePdfAndDownload(resource);
      
      // Reload resources to update download count
      loadResources();
    } catch (error) {
      console.error('Download failed:', error);
      // Still try to download even if tracking fails
      await generatePdfAndDownload(resource);
      toast.error('Download started, but tracking failed');
    }
  };

  const handlePreview = (resource: Resource) => {
    setSelectedResource(resource);
    setShowPreviewModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create lead from email capture
      await client.entities.leads.create({
        data: {
          name: emailCapture.name,
          email: emailCapture.email,
          church_name: emailCapture.church_name,
          role: emailCapture.role,
          stage: 'inquiry',
          source: 'resource_download',
          lead_score: 50,
          tags: `resource:${selectedResource?.title}`
        }
      });

      // Track download
      if (selectedResource) {
        await client.entities.resources.update({
          id: selectedResource.id.toString(),
          data: {
            downloads: (selectedResource.downloads || 0) + 1
          }
        });

        // Log download event as gated
        await logDownload(selectedResource, 'gated', emailCapture.email);

        // Generate PDF and download
        await generatePdfAndDownload(selectedResource);
      }

      toast.success('Thank you! Your PDF download will start shortly.');
      setShowGateModal(false);
      setEmailCapture({ name: '', email: '', church_name: '', role: '' });
      loadResources();
    } catch (error) {
      console.error('Email capture failed:', error);
      // Still try to download even if lead creation fails
      if (selectedResource) {
        await generatePdfAndDownload(selectedResource);
      }
      toast.error('Download started, but we could not save your information.');
      setShowGateModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Advanced filtering
  const filteredResources = resources.filter(resource => {
    if (filter !== 'all' && resource.category !== filter) return false;
    if (topicFilter !== 'all' && resource.topic !== topicFilter) return false;
    if (audienceFilter !== 'all' && resource.audience !== audienceFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = resource.title.toLowerCase().includes(query);
      const matchesDescription = resource.description?.toLowerCase().includes(query);
      const matchesTags = resource.tags?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesTags) return false;
    }
    return true;
  });

  const getRelatedResources = (resource: Resource) => {
    return resources
      .filter(r => 
        r.id !== resource.id && 
        (r.category === resource.category || r.topic === resource.topic)
      )
      .slice(0, 3);
  };

  const topics = ['all', ...new Set(resources.map(r => r.topic).filter(Boolean))] as string[];
  const audiences = ['all', ...new Set(resources.map(r => r.audience).filter(Boolean))] as string[];

  const categories = [
    { value: 'all', label: 'All Resources', count: resources.length },
    { value: 'ebook', label: 'eBooks', count: resources.filter(r => r.category === 'ebook').length },
    { value: 'guide', label: 'Guides', count: resources.filter(r => r.category === 'guide').length },
    { value: 'template', label: 'Templates', count: resources.filter(r => r.category === 'template').length },
    { value: 'checklist', label: 'Checklists', count: resources.filter(r => r.category === 'checklist').length },
    { value: 'video', label: 'Videos', count: resources.filter(r => r.category === 'video').length }
  ];

  const popularResources = [...resources]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Resource Library</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Download practical tools, templates, and guides to strengthen your ministry.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search resources by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Resource Type</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={filter === cat.value ? 'default' : 'outline'}
                    onClick={() => setFilter(cat.value)}
                    className={filter === cat.value ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' : 'hover:border-[#F4E2A3]'}
                  >
                    {cat.label} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="topic" className="text-sm font-medium text-gray-700 mb-2 block">
                  Topic
                </Label>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic} className="capitalize">
                        {topic === 'all' ? 'All Topics' : topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience" className="text-sm font-medium text-gray-700 mb-2 block">
                  Audience
                </Label>
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="All Audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience} value={audience} className="capitalize">
                        {audience === 'all' ? 'All Audiences' : audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Resources Section */}
        {popularResources.length > 0 && !searchQuery && filter === 'all' && (
          <section className="py-12 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-[#F4E2A3] mr-2" />
                <h2 className="text-2xl font-bold text-black">Most Popular</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {popularResources.map((resource) => {
                  const Icon = getCategoryIcon(resource.category);
                  const isDownloading = downloadingId === resource.id;
                  return (
                    <Card key={resource.id} className="border-2 border-[#F4E2A3]">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-[#F4E2A3] text-black">
                            <Icon className="h-3 w-3 mr-1" />
                            {resource.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {resource.downloads} downloads
                          </span>
                        </div>
                        <CardTitle className="text-lg text-black">{resource.title}</CardTitle>
                        <CardDescription className="text-gray-600 text-sm mt-1">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDownload(resource)}
                            disabled={isDownloading}
                            className="flex-1 bg-black text-[#F4E2A3] hover:bg-gray-900"
                          >
                            {isDownloading ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating PDF...</>
                            ) : (
                              <><Download className="h-4 w-4 mr-2" />Download PDF</>
                            )}
                          </Button>
                          {(resource.preview_url || resource.file_url) && (
                            <Button 
                              variant="outline"
                              onClick={() => handlePreview(resource)}
                              className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Resources Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredResources.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No resources found"
                description="Try adjusting your filters or search query."
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredResources.map((resource) => {
                    const Icon = getCategoryIcon(resource.category);
                    const isDownloading = downloadingId === resource.id;
                    return (
                      <Card key={resource.id} className="hover:shadow-xl transition-shadow border-2 hover:border-[#F4E2A3] flex flex-col">
                        {resource.thumbnail_url && (
                          <img 
                            src={resource.thumbnail_url} 
                            alt={resource.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <CardHeader className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-5 w-5 text-[#F4E2A3]" />
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {resource.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {resource.is_gated && (
                                <Badge variant="outline" className="border-[#F4E2A3] text-[#B8A44E]">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {resource.downloads || 0} downloads
                              </span>
                            </div>
                          </div>
                          <CardTitle className="text-black">{resource.title}</CardTitle>
                          <CardDescription className="text-gray-600">
                            {resource.description}
                          </CardDescription>
                          
                          {resource.tags && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {resource.tags.split(',').slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleDownload(resource)}
                              disabled={isDownloading}
                              className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                            >
                              {isDownloading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating PDF...</>
                              ) : (
                                <><Download className="h-4 w-4 mr-2" />Download PDF</>
                              )}
                            </Button>
                            {(resource.preview_url || resource.file_url) && (
                              <Button 
                                variant="outline"
                                onClick={() => handlePreview(resource)}
                                className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Email Capture Modal */}
      <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">Get Your Free Resource</DialogTitle>
            <DialogDescription>
              Enter your information to download <strong>{selectedResource?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={emailCapture.name}
                onChange={(e) => setEmailCapture(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={emailCapture.email}
                onChange={(e) => setEmailCapture(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@church.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="church">Church Name *</Label>
              <Input
                id="church"
                value={emailCapture.church_name}
                onChange={(e) => setEmailCapture(prev => ({ ...prev, church_name: e.target.value }))}
                placeholder="Grace Community Church"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role *</Label>
              <Input
                id="role"
                value={emailCapture.role}
                onChange={(e) => setEmailCapture(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Senior Pastor"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Get Free Access
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree to receive occasional ministry resources and updates.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl text-black">{selectedResource?.title}</DialogTitle>
            <DialogDescription>Preview</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            {selectedResource?.category === 'video' && selectedResource.preview_url ? (
              <video controls className="w-full rounded-lg">
                <source src={selectedResource.preview_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (selectedResource?.preview_url || selectedResource?.file_url) ? (
              <iframe
                src={selectedResource.preview_url || selectedResource.file_url}
                className="w-full h-[500px] rounded-lg border"
                title="Resource Preview"
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Preview not available for this resource.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </Button>
            {selectedResource && (
              <Button
                onClick={() => {
                  handleDownload(selectedResource);
                  setShowPreviewModal(false);
                }}
                disabled={downloadingId === selectedResource.id}
                className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
              >
                {downloadingId === selectedResource.id ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating PDF...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Download PDF</>
                )}
              </Button>
            )}
          </div>

          {selectedResource && getRelatedResources(selectedResource).length > 0 && (
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold text-black mb-3">Related Resources</h4>
              <div className="grid grid-cols-3 gap-3">
                {getRelatedResources(selectedResource).map((related) => (
                  <Card key={related.id} className="cursor-pointer hover:border-[#F4E2A3]" onClick={() => {
                    setSelectedResource(related);
                  }}>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm text-black line-clamp-2">{related.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}