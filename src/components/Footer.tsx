import { Fish, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id: string) => {
    if (location.pathname !== "/") {
      
      navigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gradient-to-t from-secondary/20 to-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Fish className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-black bg-clip-text text-transparent">
                AquaLink
              </span>
            </div>
            </Link>
            <p className="text-muted-foreground text-lg mb-6 max-w-md">
              Your trusted partner in premium guppy fish distribution. We provide the finest quality fish with advanced stock management and real-time monitoring systems.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-m text-muted-foreground font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@aqualink.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-xl text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="font-semibold text-muted-foreground hover:text-primary transition-colors ">
                  Home
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleScroll('about')}
                  className="font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <Link to="/marketplace" className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleScroll('contact')}
                  className="font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-xl text-foreground mb-4">Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="font-semibold">Stock Management</li>
              <li className="font-semibold">Live Fish Monitoring</li>
              <li className="font-semibold">Quality Assurance</li>
              <li className="font-semibold">Distribution Network</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 AquaLink. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;