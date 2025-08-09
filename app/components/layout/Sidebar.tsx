"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, Briefcase, LogOut, LogIn } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Create a utility function for the cn function if it doesn't exist
const utilsCn = (...inputs: any[]) => {
  return inputs.filter(Boolean).join(" ");
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    {
      label: "Job Search",
      href: "/",
      icon: <Search className="h-6 w-6 text-gray-700 dark:text-gray-300 flex-shrink-0" />,
    },
  ];

  // Add Applied Jobs link if user is logged in
  if (user) {
    navLinks.push({
      label: "Applied Jobs",
      href: "/applied-jobs",
      icon: <Briefcase className="h-6 w-6 text-gray-700 dark:text-gray-300 flex-shrink-0" />,
    });
  }

  return (
    <SidebarProvider open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarBody>
        {/* Logo and Header */}
        <div className="mb-8">
          <Link href="/">
            <div className="flex items-center gap-2 py-4">
              <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <motion.div
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? "auto" : 0,
                  overflow: "hidden",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-xl font-bold whitespace-nowrap">OpusLink</div>
                <div className="text-sm text-gray-500 whitespace-nowrap">Job Search Platform</div>
              </motion.div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              link={link}
              className={
                isActive(link.href)
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-md px-2"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2"
              }
            />
          ))}
        </div>

        {/* User Profile or Login Button */}
        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-800">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center px-2 py-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <motion.div
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    width: sidebarOpen ? "auto" : 0,
                    overflow: "hidden",
                  }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {user.email}
                </motion.div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center py-2 px-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-6 w-6 mr-3 flex-shrink-0" />
                <motion.span
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    width: sidebarOpen ? "auto" : 0,
                    overflow: "hidden",
                  }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center py-2 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
            >
              <LogIn className="h-6 w-6 mr-3 flex-shrink-0" />
              <motion.span
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  width: sidebarOpen ? "auto" : 0,
                  overflow: "hidden",
                }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Login / Sign Up
              </motion.span>
            </Link>
          )}
        </div>
      </SidebarBody>
    </SidebarProvider>
  );
}

// Sidebar components
const SidebarBody = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DesktopSidebar>{children}</DesktopSidebar>
      <MobileSidebar>{children}</MobileSidebar>
    </>
  );
};

const DesktopSidebar = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className="h-screen px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-gray-900 shadow-md flex-shrink-0 fixed left-0 top-0 z-10"
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  );
};

const MobileSidebar = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div className="h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-gray-900 shadow-md w-full fixed top-0 left-0 z-10">
        <Link href="/">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div className="ml-2">
              <div className="text-xl font-bold">OpusLink</div>
            </div>
          </div>
        </Link>
        <div className="flex justify-end z-20">
          <Menu
            className="text-gray-800 dark:text-gray-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="fixed h-full w-full inset-0 bg-white dark:bg-gray-900 p-10 z-[100] flex flex-col"
            >
              <div
                className="absolute right-10 top-10 z-50 text-gray-800 dark:text-gray-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="md:hidden h-16"></div> {/* Spacer for mobile view */}
    </>
  );
};

const SidebarLink = ({
  link,
  className,
}: {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  className?: string;
}) => {
  const { open } = useSidebar();
  return (
    <Link
      href={link.href}
      className={utilsCn(
        "flex items-center gap-2 group/sidebar py-2",
        className
      )}
    >
      {link.icon}
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          width: open ? "auto" : 0,
          overflow: "hidden"
        }}
        transition={{ duration: 0.2 }}
        className="text-gray-700 dark:text-gray-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-nowrap"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};