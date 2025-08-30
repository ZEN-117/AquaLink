import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Fish, Menu, X, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", action: () => scrollToSection("about") },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Contact", action: () => scrollToSection("contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="text-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className="text-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Center - Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Fish className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AquaFlow
            </span>
          </Link>

          {/* Right - User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-foreground">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button variant="ocean" size="sm">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in-up">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="block text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="block text-foreground hover:text-primary transition-colors py-2 text-left"
                    >
                      {item.name}
                    </button>
                  )}
                </div>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="ocean" size="sm">
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;