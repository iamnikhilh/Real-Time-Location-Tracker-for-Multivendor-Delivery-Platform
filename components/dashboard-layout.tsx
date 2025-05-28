"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  TruckIcon, 
  HomeIcon, 
  PackageIcon, 
  MapIcon, 
  UserIcon, 
  LogOutIcon, 
  MenuIcon,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logout, getCurrentUser, isAuthenticated } from '@/lib/auth';
import { Role } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is authenticated and has the correct role
    if (isMounted) {
      const authenticated = isAuthenticated();
      const user = getCurrentUser();
      
      if (!authenticated || !user || user.role !== role) {
        router.replace('/login');
      }
    }
  }, [isMounted, router, role]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  
  // Navigation items based on role
  const navigationItems = {
    vendor: [
      { name: 'Dashboard', href: '/dashboard/vendor', icon: HomeIcon },
      { name: 'Orders', href: '/dashboard/vendor/orders', icon: PackageIcon },
      { name: 'Delivery Partners', href: '/dashboard/vendor/partners', icon: TruckIcon },
    ],
    delivery: [
      { name: 'Dashboard', href: '/dashboard/delivery', icon: HomeIcon },
      { name: 'My Deliveries', href: '/dashboard/delivery/orders', icon: PackageIcon },
      { name: 'Active Delivery', href: '/dashboard/delivery/active', icon: MapIcon },
    ],
    customer: [
      { name: 'Dashboard', href: '/dashboard/customer', icon: HomeIcon },
      { name: 'My Orders', href: '/dashboard/customer/orders', icon: PackageIcon },
      { name: 'Track Order', href: '/dashboard/customer/track', icon: MapIcon },
    ],
  };

  const items = navigationItems[role] || [];
  const roleName = role === 'delivery' ? 'Delivery Partner' : role.charAt(0).toUpperCase() + role.slice(1);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <Sheet>
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <Link href="/" className="flex items-center">
            <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-lg">DeliverTrack</span>
          </Link>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left">
          <div className="flex flex-col h-full">
            <div className="py-4 border-b">
              <Link href="/" className="flex items-center px-2 mb-6">
                <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
                <span className="font-bold text-lg">DeliverTrack</span>
              </Link>
              <div className="px-2 mb-2 text-sm font-medium text-gray-500">{roleName} Portal</div>
            </div>
            <nav className="flex-1 py-6">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                    >
                      <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t py-4">
              <Button
                variant="ghost"
                className="w-full justify-start px-2"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-5 w-5 mr-3 text-gray-500" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-screen">
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="px-6 py-6 border-b">
            <Link href="/" className="flex items-center mb-6">
              <TruckIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-bold text-lg">DeliverTrack</span>
            </Link>
            <div className="text-sm font-medium text-gray-500">{roleName} Portal</div>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                  >
                    <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t px-4 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </Button>
          </div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Main Content */}
      <div className="lg:hidden">{children}</div>
    </div>
  );
}