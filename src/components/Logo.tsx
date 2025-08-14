// components/ui/LogoWithImage.tsx
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "xs";
  variant?: "default" | "minimal" | "stacked";
  imageSrc?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  showName = true,
  size = "sm",
  variant = "default",
  imageSrc = "/bookmark.png", // Default logo path
}) => {
  const sizeConfig = {
    xs: { dimension: 20, textClass: "text-lg" },
    sm: { dimension: 24, textClass: "text-lg" },
    md: { dimension: 32, textClass: "text-xl" },
    lg: { dimension: 40, textClass: "text-2xl" },
    xl: { dimension: 48, textClass: "text-3xl" },
  };

  const config = sizeConfig[size];

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center space-y-2", className)}>
        <Image
          src={imageSrc}
          alt="BookmarkVault Logo"
          width={config.dimension}
          height={config.dimension}
          className="object-contain"
        />
        {showName && (
          <span
            className={cn(
              "font-bold text-primary tracking-tight text-center",
              config.textClass
            )}
          >
            BookmarkVault
          </span>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src={imageSrc}
          alt="BookmarkVault Logo"
          width={config.dimension}
          height={config.dimension}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Image
        src={imageSrc}
        alt="BookmarkVault Logo"
        width={config.dimension}
        height={config.dimension}
        className="object-contain"
      />
      {showName && (
        <span
          className={cn(
            "font-bold text-primary tracking-tight",
            config.textClass
          )}
        >
          BookmarkVault
        </span>
      )}
    </div>
  );
};
