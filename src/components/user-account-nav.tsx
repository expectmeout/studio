
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Settings, CreditCard, LogOut as LogOutIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

interface UserAccountNavProps {
  user: { // This structure is now for display purposes, actual user comes from context
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSettingsClick: () => void;
  onBillingClick: () => void;
  // onLogoutClick is removed, will use context's signOut
}

export function UserAccountNav({
  user,
  onSettingsClick,
  onBillingClick,
}: UserAccountNavProps) {
  const { signOut, user: authUser } = useAuth(); // Get signOut and authUser from context

  const getInitials = (name?: string | null) : string => {
    if (!name) return "";
    // If email is used as name and contains '@', try to get initials from before '@'
    if (name.includes('@') && name === authUser?.email) {
        const emailPrefix = name.split('@')[0];
        const names = emailPrefix.replace(/[^a-zA-Z\s]/g, ' ').trim().split(/\s+/);
        if (names.length > 0 && names[0]) {
            let initials = names[0].substring(0, 1).toUpperCase();
            if (names.length > 1 && names[names.length -1]) {
                initials += names[names.length - 1].substring(0, 1).toUpperCase();
            }
            return initials;
        }
    }
    // Original logic for names
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1 && names[names.length-1]) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  
  const displayName = user.name || "User";
  const displayEmail = user.email || "No email";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} data-ai-hint="user avatar" />
            ) : (
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBillingClick}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}> {/* Use signOut from context */}
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
