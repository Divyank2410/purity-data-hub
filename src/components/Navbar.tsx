
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = ({ session, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully signed out!");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Water & Sewerage Lab</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">
              Contact Us
            </Link>
            
            {session ? (
              <>
                {userRole === "admin" ? (
                  <Link to="/admin-dashboard" className="ml-4">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      Admin Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard" className="ml-4">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      My Dashboard
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={handleSignOut}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/user-dashboard" className="ml-4">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    User Dashboard
                  </Button>
                </Link>
                <Link to="/admin-dashboard" className="ml-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Admin Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/contact" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            
            {session ? (
              <>
                {userRole === "admin" ? (
                  <Link 
                    to="/admin-dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/user-dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  User Dashboard
                </Link>
                <Link 
                  to="/admin-dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
