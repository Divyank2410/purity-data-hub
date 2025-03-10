
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Water & Sewerage Laboratory</h3>
            <p className="text-gray-300">
              Gwalior Municipal Corporation <br />
              Providing quality water and sewerage testing services.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link to="/user-dashboard" className="text-gray-300 hover:text-white">User Dashboard</Link>
              </li>
              <li>
                <Link to="/admin-dashboard" className="text-gray-300 hover:text-white">Admin Dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <address className="text-gray-300 not-italic">
              Gwalior Municipal Corporation<br />
              City Center, Gwalior<br />
              Madhya Pradesh, India<br /><br />
              <span className="font-medium">Email:</span> info@gwaliormunicipal.gov.in<br />
              <span className="font-medium">Phone:</span> +91 123 456 7890
            </address>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Water & Sewerage Laboratory, Gwalior Municipal Corporation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
