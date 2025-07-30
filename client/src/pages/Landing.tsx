import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, ArrowRight, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";

interface LandingProps {
  showLogin?: boolean;
}

export default function Landing({ showLogin = false }: LandingProps) {
  const [showLoginForm, setShowLoginForm] = useState(showLogin);

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Camera className="mx-auto h-12 w-12 text-accent" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Portal</h2>
            <p className="mt-2 text-gray-600">Sign in to manage your portfolio</p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-xl">
            <CardContent className="py-8 px-4 sm:px-10">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/api/login";
              }}>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>
                  <a href="#" className="text-sm text-accent hover:text-accent/80">
                    Forgot password?
                  </a>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginForm(false)}
            >
              Back to Portfolio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation onAdminClick={() => setShowLoginForm(true)} />
      
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-cover bg-center bg-gray-900"
             style={{
               backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')`
             }}>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            <h1 className="text-5xl md:text-7xl font-light mb-6">
              Capturing Life's<br />Precious Moments
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 opacity-90">
              Professional photographer specializing in weddings, portraits, and nature photography
            </p>
            <Link href="/gallery">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 py-4 text-lg font-medium">
                View My Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Alex Chen Portrait"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl font-light mb-6">Meet Alex Chen</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With over 8 years of experience in photography, I specialize in capturing the authentic emotions and genuine moments that make your special occasions unforgettable.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From intimate wedding ceremonies to stunning nature landscapes, my goal is to tell your story through compelling visual narratives that you'll treasure for a lifetime.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">500+</div>
                  <div className="text-gray-600">Weddings Captured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">1000+</div>
                  <div className="text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">8</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Photography Services</h2>
            <p className="text-xl text-gray-600">Specialized in various photography styles to meet your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Wedding Photography"
                className="rounded-xl shadow-lg w-full h-64 object-cover mb-6 group-hover:shadow-2xl transition-shadow"
              />
              <h3 className="text-2xl font-medium mb-4">Wedding Photography</h3>
              <p className="text-gray-600 leading-relaxed">
                Capturing your special day with artistic vision and attention to every precious detail.
              </p>
            </div>
            <div className="text-center group">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Portrait Photography"
                className="rounded-xl shadow-lg w-full h-64 object-cover mb-6 group-hover:shadow-2xl transition-shadow"
              />
              <h3 className="text-2xl font-medium mb-4">Portrait Photography</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional headshots and personal portraits that showcase your unique personality.
              </p>
            </div>
            <div className="text-center group">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Nature Photography"
                className="rounded-xl shadow-lg w-full h-64 object-cover mb-6 group-hover:shadow-2xl transition-shadow"
              />
              <h3 className="text-2xl font-medium mb-4">Nature Photography</h3>
              <p className="text-gray-600 leading-relaxed">
                Breathtaking landscapes and wildlife photography that celebrates natural beauty.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Alex Chen Photography</h3>
              <p className="text-gray-400 mb-4">
                Capturing life's precious moments with artistic vision and professional expertise.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Wedding Photography</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Portrait Sessions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nature Photography</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Event Photography</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>123 Photography Street</p>
                <p>San Francisco, CA 94102</p>
                <p>+1 (555) 123-4567</p>
                <p>hello@alexchenphotography.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Alex Chen Photography. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
