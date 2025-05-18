import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import logo from "../../assets/logo.png";
import { Menu, X } from "lucide-react";
import DeleteConfirmModal from "../modals/common/DeleteConfirmModal";

const Sidebar: React.FC = () => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user = localStorage.getItem("user");
  const userRole = user ? JSON.parse(user).role : null;

  const navItems = [
    { name: "Overview", path: "/dashboard/overview", roles: ["ADMIN"] },
    { name: "Vehicles", path: "/dashboard/vehicles", roles: ["USER"] },
    { name: "Slots", path: "/dashboard/slots", roles: ["ADMIN"] },
    { name: "Requests", path: "/dashboard/requests", roles: ["ADMIN", "USER"] },
    { name: "Users", path: "/dashboard/users", roles: ["ADMIN"] },
  ];

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white">
        <img src={logo} alt="Logo" className="h-10" />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
         bg-white z-40 shadow-md lg:shadow-none
          fixed top-0 left-0 h-screen w-60 p-6 transition-transform transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative lg:flex lg:flex-col
          rounded-none lg:rounded-none
        `}
      >
        <div className="mb-8 text-center">
          <h1 className="font-bold text-xl">ParkingTrack</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-4">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `block px-5 py-3 rounded-md hover:bg-blue-400 ${
                    isActive ? "bg-blue-700 text-white font-semibold" : ""
                  }`
                }
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto mb-6">
          <Button
            variant="outline"
            onClick={confirmLogout}
            className="w-full px-5 py-6 rounded-md bg-gray-100 border-2 text-black"
          >
            Logout
          </Button>
        </div>

        {/* Logout Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isLogoutConfirmOpen}
          onOpenChange={setIsLogoutConfirmOpen}
          onConfirm={handleLogout}
          title="Confirm Logout"
          description="Are you sure you want to logout? This action cannot be undone."
          confirmText="Logout"
          loadingText="Logging out ..."
        />
      </aside>
    </>
  );
};

export default Sidebar;
