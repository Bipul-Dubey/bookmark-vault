// components/profile/ProfileHeader.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Calendar, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";
import { DeleteAccountSection } from "./DeleteAccountSection";

interface ProfileHeaderProps {
  totalBookmarks: number;
  uniqueTagsCount: number;
}

export function ProfileHeader({
  totalBookmarks,
  uniqueTagsCount,
}: ProfileHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case "google.com":
        return "Google";
      case "password":
        return "Email/Password";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg sm:text-xl">
                Profile Information
              </CardTitle>
            </div>
            <div>
              <DeleteAccountSection
                totalBookmarks={totalBookmarks}
                uniqueTagsCount={uniqueTagsCount}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0">
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || "User"}
              />
              <AvatarFallback className="text-lg sm:text-xl">
                {getInitials(user.displayName || user.email || "U")}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold truncate">
                {user.displayName || "User"}
              </h2>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate text-sm sm:text-base">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  <span className="text-sm sm:text-base">
                    Joined {formatDate(user.metadata.creationTime || null)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Sign-in Method
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.providerData.map((provider, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs sm:text-sm"
                  >
                    {getProviderName(provider.providerId)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Last Sign In
              </h3>
              <p className="text-sm sm:text-base">
                {formatDate(user.metadata.lastSignInTime || null)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
