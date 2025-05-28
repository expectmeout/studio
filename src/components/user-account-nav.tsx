
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
import { Settings, CreditCard, LogOut as LogOutIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserAccountNavProps {
  onSettingsClick: () => void;
  onBillingClick: () => void;
}

export function UserAccountNav({
  onSettingsClick,
  onBillingClick,
}: UserAccountNavProps) {
  const { signOut, user: authUser } = useAuth();

  const getInitials = (companyName?: string | null, email?: string | null): string => {
    if (companyName) {
      const words = companyName.trim().split(/\s+/);
      if (words.length > 0 && words[0]) {
        let initials = words[0].substring(0, 1).toUpperCase();
        if (words.length > 1 && words[words.length - 1]) {
          initials += words[words.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
      }
    }
    if (email) {
      const emailPrefix = email.split('@')[0];
      if (emailPrefix) {
        const nameParts = emailPrefix.replace(/[^a-zA-Z\s.]/g, ' ').trim().split(/[.\s]+/);
        if (nameParts.length > 0 && nameParts[0]) {
            let initials = nameParts[0].substring(0, 1).toUpperCase();
            if (nameParts.length > 1 && nameParts[nameParts.length-1]) {
                initials += nameParts[nameParts.length - 1].substring(0, 1).toUpperCase();
            }
            if (initials.length > 0) return initials;
        }
        return email.substring(0, 1).toUpperCase();
      }
    }
    return "U";
  };
  
  const companyName = authUser?.user_metadata?.company_name;
  const email = authUser?.email;
  const avatarUrl = authUser?.user_metadata?.avatar_url;

  const displayName = companyName || email || "User";
  const displayEmail = email || "No email provided";
  const avatarFallback = getInitials(companyName, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint="user avatar company" />
            ) : (
              <AvatarFallback>{avatarFallback}</AvatarFallback>
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
        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
