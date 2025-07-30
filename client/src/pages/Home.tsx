import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, LogOut, BarChart3, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Camera className="h-12 w-12 text-accent mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Welcome back, {user?.firstName || user?.username || 'Admin'}!
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Manage your photography portfolio
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link href="/admin">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Admin Dashboard</h3>
                      <p className="text-gray-600">Manage photos and sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/gallery">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Camera className="h-8 w-8 text-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">View Gallery</h3>
                      <p className="text-gray-600">See your public portfolio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Contact</h3>
                      <p className="text-gray-600">Get in touch with clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Stats
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Sections
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Preview Gallery
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
