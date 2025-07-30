import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface NavigationProps {
  onAdminClick?: () => void;
}

export default function Navigation({ onAdminClick }: NavigationProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const handleAdminClick = () => {
    setIsOpen(false);
    if (onAdminClick) {
      onAdminClick();
    } else {
      window.location.href = "/api/login";
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <span className="text-2xl font-bold">Alex Chen</span>
              <span className="ml-2 text-sm text-gray-500">Photography</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-accent text-white"
                      : "text-gray-600 hover:text-accent"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleAdminClick}
              className="px-4 py-2 rounded-lg text-gray-600 hover:text-accent transition-colors"
            >
              Admin
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? "bg-accent text-white"
                          : "text-gray-600 hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  onClick={handleAdminClick}
                  className="w-full justify-start text-gray-600 hover:text-accent"
                >
                  Admin
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
