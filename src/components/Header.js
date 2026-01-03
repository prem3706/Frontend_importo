import { useState } from "react";
import { Menu, X } from "lucide-react"; // hamburger and close icons
import logo1 from "../images/logo1.jpg";
import { Link } from "react-router-dom";
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { label: "Home", to: "/#home" },
    { label: "About", to: "/#about" },
    { label: "Features", to: "/#features" },
    { label: "Contact", to: "/#contact" },
    { label: "Login", to: "/login" },
    { label: "Signup", to: "/signup" },
  ];


  return (
    <header className="sticky top-0 left-0 w-full bg-offwhite z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={logo1}
            alt="Importo Transport"
            className="h-12"
            style={{ height: "65px" }}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-7">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="relative text-gray-800 font-medium transition-colors duration-300 hover:text-green-900
      after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-green-900
      after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>


        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-offwhite border-t border-gray-200">
          <nav className="flex flex-col space-y-3 p-5">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsOpen(false)} // mobile close
                className="relative text-gray-800 font-medium transition-colors duration-300 hover:text-green-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

        </div>
      )}
    </header>
  );
}
