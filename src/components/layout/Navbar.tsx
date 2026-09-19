import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Bell, Menu, LogOut, User, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useNotifications } from "@/hooks/useNotifications";
import { getInitials } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavLink {
  label: string;
  to: string;
}

function getNavLinks(role?: string): NavLink[] {
  if (role === "patient") {
    return [
      { label: "Dashboard", to: "/patient/dashboard" },
      { label: "Find Doctors", to: "/doctors" },
      { label: "Appointments", to: "/patient/appointments" },
      { label: "Health Records", to: "/patient/records" },
    ];
  }
  if (role === "doctor") {
    return [
      { label: "Dashboard", to: "/doctor/dashboard" },
      { label: "Appointments", to: "/doctor/appointments" },
    ];
  }
  return [{ label: "Home", to: "/" }];
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotificationStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Trigger notification polling
  useNotifications();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = getNavLinks(user?.role);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleMarkRead(id: string) {
    markRead(id);
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // silently ignore
    }
  }

  async function handleMarkAllRead() {
    markAllRead();
    try {
      await api.patch("/notifications/read-all");
    } catch {
      // silently ignore
    }
  }

  function isActive(to: string) {
    return location.pathname === to;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white transition-shadow duration-300",
        scrolled && "shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Heart className="size-7 fill-[#1B2B6B] text-[#1B2B6B]" />
          <span className="font-[Manrope] text-xl font-bold text-[#1B2B6B]">
            HEALHUB
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.to)
                  ? "text-[#1B2B6B]"
                  : "text-muted-foreground hover:text-[#1B2B6B]"
              )}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute inset-x-1 -bottom-[1.19rem] h-0.5 rounded-full bg-[#1B2B6B]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user && (
            <>
              {/* Notification Bell */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5 text-[#1B2B6B]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#E53935] text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 p-0"
                  sideOffset={8}
                >
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleMarkAllRead}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Check className="size-3" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-72">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              if (!notif.read) {
                                handleMarkRead(notif.id);
                              }
                            }}
                            className={cn(
                              "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                              !notif.read && "bg-blue-50/60"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                notif.read
                                  ? "bg-transparent"
                                  : "bg-[#1B2B6B]"
                              )}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm leading-snug text-foreground">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(notif.createdAt)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar size="default">
                      <AvatarFallback className="bg-[#1B2B6B] text-xs font-semibold text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.role === "doctor" ? "Doctor" : "Patient"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5 text-[#1B2B6B]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="size-5 fill-[#1B2B6B] text-[#1B2B6B]" />
                  <span className="font-[Manrope] text-lg font-bold text-[#1B2B6B]">
                    HEALHUB
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(link.to)
                          ? "bg-[#1B2B6B]/10 text-[#1B2B6B]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                {isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#E53935] transition-colors hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
