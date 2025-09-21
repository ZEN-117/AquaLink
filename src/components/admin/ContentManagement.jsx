import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, Image, Video } from "lucide-react";

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock content data
  const guppyListings = [
    { id: 1, title: "Premium Blue Guppy", author: "John Doe", status: "Published", type: "Product", created: "2 days ago", views: 234 },
    { id: 2, title: "Rainbow Guppy Collection", author: "Jane Smith", status: "Draft", type: "Product", created: "1 day ago", views: 89 },
    { id: 3, title: "Guppy Care Guide", author: "Admin", status: "Published", type: "Article", created: "1 week ago", views: 1420 },
    { id: 4, title: "Breeding Tips", author: "Expert Bob", status: "Pending", type: "Article", created: "3 days ago", views: 156 },
  ];

  const mediaFiles = [
    { id: 1, name: "guppy-hero.jpg", type: "Image", size: "2.4 MB", uploaded: "2 days ago", usage: "Hero Section" },
    { id: 2, name: "care-video.mp4", type: "Video", size: "15.7 MB", uploaded: "1 week ago", usage: "Tutorial" },
    { id: 3, name: "product-gallery.jpg", type: "Image", size: "1.8 MB", uploaded: "3 days ago", usage: "Product Gallery" },
    { id: 4, name: "breeding-guide.pdf", type: "Document", size: "890 KB", uploaded: "5 days ago", usage: "Downloads" },
  ];

  const filteredContent = guppyListings.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = mediaFiles.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Published': return 'default';
      case 'Draft': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Image': return <Image className="h-4 w-4" />;
      case 'Video': return <Video className="h-4 w-4" />;
      case 'Document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Manage guppy listings, articles, and media files</p>
        </div>
        <Button className="bg-gradient-aqua hover:bg-gradient-aqua/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-green-600">+8 this week</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-orange-600">Needs attention</p>
          </CardContent>
        </Card>
        <Card className="border-aqua/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">2.4 GB total</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content & Listings</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content & Listings</CardTitle>
                  <CardDescription>Manage guppy listings, articles, and other content</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search content..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-aqua/20 focus:border-aqua"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{item.views}</TableCell>
                      <TableCell className="text-muted-foreground">{item.created}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card className="border-aqua/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Media Library</CardTitle>
                  <CardDescription>Manage images, videos, and documents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search media..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-aqua/20 focus:border-aqua"
                    />
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedia.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.usage}</TableCell>
                      <TableCell className="text-muted-foreground">{file.uploaded}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Info
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;