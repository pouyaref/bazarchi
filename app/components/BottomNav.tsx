"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, ShoppingCart, User, MoreHorizontal, Plus, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  requireAuth?: boolean;
}

const guestNavItems: NavItem[] = [
  { id: "home", label: "خانه", icon: <Home className="w-6 h-6" />, path: "/" },
  { id: "search", label: "جستجو", icon: <Search className="w-6 h-6" />, path: "/search" },
  { id: "cart", label: "سبد خرید", icon: <ShoppingCart className="w-6 h-6" />, path: "/cart" },
  { id: "profile", label: "پروفایل", icon: <User className="w-6 h-6" />, path: "/profile" },
  { id: "more", label: "بیشتر", icon: <MoreHorizontal className="w-6 h-6" />, path: "/more" },
];

const authNavItems: NavItem[] = [
  { id: "home", label: "خانه", icon: <Home className="w-6 h-6" />, path: "/" },
  { id: "search", label: "جستجو", icon: <Search className="w-6 h-6" />, path: "/search" },
  { id: "create", label: "ثبت آگهی", icon: <Plus className="w-6 h-6" />, path: "/create-ad", requireAuth: true },
  { id: "messages", label: "گفتگوها", icon: <MessageCircle className="w-6 h-6" />, path: "/conversations", requireAuth: true },
  { id: "profile", label: "پروفایل", icon: <User className="w-6 h-6" />, path: "/profile", requireAuth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  const navItems = user ? authNavItems : guestNavItems;

  const handleNavClick = (item: NavItem) => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (item.requireAuth && !user) {
      router.push("/login");
      return;
    }
    router.push(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/" && pathname === "/");
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-0 px-2 transition-colors relative"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`mb-1 ${isActive ? "text-blue-600" : "text-slate-500"}`}
              >
                {item.id === "create" ? (
                  <div className="w-12 h-12 -mt-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  item.icon
                )}
              </motion.div>
              {item.id !== "create" && (
                <span
                  className={`text-xs font-medium truncate w-full text-center ${
                    isActive ? "text-blue-600" : "text-slate-500"
                  }`}
                  dir="rtl"
                >
                  {item.label}
                </span>
              )}
              {isActive && item.id !== "create" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-b-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
