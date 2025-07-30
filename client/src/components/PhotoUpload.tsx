import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Upload } from "lucide-react";
import type { Section } from "@shared/schema";

export default function PhotoUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    tags: '',
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/admin/sections"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; metadata: any }) => {
      const formData = new FormData();
      formData.append('photo', data.file);
      formData.append('title', data.metadata.title);
      formData.append('description', data.metadata.description);
      formData.append('sectionId', data.metadata.sectionId);
      formData.append('tags', data.metadata.tags);

      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      // Reset form
      setFiles([]);
      setFormData({
        title: '',
        description: '',
        sectionId: '',
        tags: '',
      });
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
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    setFiles(imageFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
      setFiles(imageFiles);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    // Upload the first file (can be extended for multiple files)
    uploadMutation.mutate({
      file: files[0],
      metadata: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? "border-accent bg-accent/5" 
            : "border-gray-300 hover:border-accent"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mb-2">Drag and drop your photos here</p>
        <p className="text-sm text-gray-400 mb-4">or</p>
        <label htmlFor="file-upload">
          <Button type="button" className="bg-accent hover:bg-accent/90 text-white">
            Browse Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WebP up to 10MB</p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files:</Label>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Photo Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="section">Category</Label>
          <Select 
            value={formData.sectionId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-2 resize-none"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="wedding, outdoor, golden hour"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="mt-2"
        />
        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={uploadMutation.isPending || files.length === 0}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploadMutation.isPending ? 'Uploading...' : 'Upload Photos'}
      </Button>
    </form>
  );
}
