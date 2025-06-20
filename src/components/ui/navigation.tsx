import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed BackendStatus import as it is no longer used
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, ShoppingCart } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
              🍽️
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              CampusEats
            </span>
          </Link>

          {/* Always show Home link for easy navigation */}
          <div className="hidden md:flex items-center space-x-4 ml-8">
            <Link
              to={
                user
                  ? user.role === "student"
                    ? "/home"
                    : user.role === "shopkeeper"
                      ? "/admin"
                      : "/developer"
                  : "/"
              }
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/home") ||
                isActive("/admin") ||
                isActive("/developer") ||
                (!user && isActive("/"))
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {user ? "Home" : "Explore"}
            </Link>

            {user && user.role === "student" && (
              <Link
                to="/orders"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/orders") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                My Orders
              </Link>
            )}

            {user && user.role === "shopkeeper" && (
              <>
                <Link
                  to="/admin/shop-setup"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/admin/shop-setup")
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  Shop Setup
                </Link>
                <Link
                  to="/admin/menu"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/admin/menu")
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  Menu
                </Link>
                <Link
                  to="/admin/orders"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/admin/orders")
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  Orders
                </Link>
              </>
            )}

            {user && user.role === "developer" && (
              <Link
                to="/developer"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/developer")
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                Analytics
              </Link>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {user && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to={
                        user.role === "student"
                          ? "/home"
                          : user.role === "shopkeeper"
                            ? "/admin"
                            : "/developer"
                      }
                    >
                      Home
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "student" && (
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "shopkeeper" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/shop-setup">Shop Setup</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/menu">Menu</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/orders">Orders</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Backend Status Indicator */}
          {/* Removed BackendStatus component usage */}

          {!user ? (
            <div className="flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
