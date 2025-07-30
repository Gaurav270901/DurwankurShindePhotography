import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import PhotoUpload from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  Folder, 
  Eye, 
  Mail, 
  LogOut, 
  Plus, 
  Edit,
  Trash2,
  Clock,
  MessageCircle,
  Upload
} from "lucide-react";
import type { PhotoWithSection, Section, ContactMessage } from "@shared/schema";

interface Stats {
  totalPhotos: number;
  totalSections: number;
  totalViews: number;
  newMessages: number;
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<PhotoWithSection[]>({
    queryKey: ["/api/admin/photos"],
    retry: false,
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/admin/sections"],
    retry: false,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    retry: false,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest('DELETE', `/api/admin/photos/${photoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentPhotos = photos.slice(0, 5);
  const unreadMessages = messages.filter(msg => !msg.isRead);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Camera className="h-6 w-6 text-accent mr-3" />
                <span className="text-xl font-semibold">Admin Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, Admin</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Camera className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Photos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalPhotos || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Folder className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalSections || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalViews || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New Messages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.newMessages || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo Upload Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload New Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoUpload />
                </CardContent>
              </Card>

              {/* Recent Photos */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  {photosLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentPhotos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No photos uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentPhotos.map((photo) => (
                        <div key={photo.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={`/api/images/${photo.filename}`}
                              alt={photo.title}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium">{photo.title}</h4>
                              <p className="text-sm text-gray-500">
                                {photo.section?.name || 'Uncategorized'} • {photo.views} views
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deletePhotoMutation.mutate(photo.id)}
                              disabled={deletePhotoMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : unreadMessages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No new messages.</p>
                  ) : (
                    <div className="space-y-4">
                      {unreadMessages.slice(0, 5).map((message) => (
                        <div key={message.id} className="p-3 bg-accent/5 border-l-4 border-accent rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {message.firstName} {message.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{message.email}</p>
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {message.message}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  {sectionsLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <Skeleton className="h-4 w-4 mr-3" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-6 w-6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <div key={section.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <Folder className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm font-medium">{section.name}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({photos.filter(p => p.sectionId === section.id).length} photos)
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Section
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
