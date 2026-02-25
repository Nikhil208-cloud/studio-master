
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  PencilLine,
  Goal,
  User,
  LogOut,
  Utensils,
  History,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useState } from "react";

export function AppSidebar({ appName }: { appName: string }) {
  const pathname = usePathname();
  const { user, userData, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/100x100/78716C/F5F5F4.png");

  useEffect(() => {
    if (user && userData) {
      if (userData.profile?.profilePic) {
        setAvatarUrl(userData.profile.profilePic);
        return;
      }

      const gender = userData.profile?.gender;
      
      const maleAvatars = [
        { url: "https://placehold.co/100x100/3B82F6/E0F2FE.png" },
        { url: "https://placehold.co/100x100/10B981/D1FAE5.png" },
      ];
      const femaleAvatars = [
        { url: "https://placehold.co/100x100/EC4899/FCE7F3.png" },
        { url: "https://placehold.co/100x100/8B5CF6/EDE9FE.png" },
      ];

      let selectedAvatar;
      if (gender === 'male') {
        selectedAvatar = maleAvatars[Math.floor(Math.random() * maleAvatars.length)];
      } else if (gender === 'female') {
        selectedAvatar = femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)];
      } else {
        selectedAvatar = { url: "https://placehold.co/100x100/78716C/F5F5F4.png" };
      }
      
      setAvatarUrl(selectedAvatar.url);
    }
  }, [user, userData]);

  const menuItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/log",
      label: "Log Entry",
      icon: PencilLine,
    },
    {
      href: "/calories",
      label: "Calorie Tracker",
      icon: Utensils,
    },
    {
      href: "/goals",
      label: "Goals",
      icon: Goal,
    },
    {
        href: "/history",
        label: "Health History",
        icon: History,
    },
    {
      href: "/profile",
      label: "User Profile",
      icon: User,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">{appName}</span>
        </div>
        <div className="flex items-center gap-2">
            <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarSeparator />

      <SidebarFooter>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:gap-0">
                    <Avatar className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                        <AvatarImage src={avatarUrl} alt="User" />
                        <AvatarFallback>{user?.email.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="font-semibold truncate">User</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="mb-2 ml-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4"/>
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

    