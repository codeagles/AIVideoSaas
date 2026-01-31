import { User } from "lucide-react";
import { cn } from "@/components/ui";

interface UserAvatarProps {
  user: {
    name: string | null;
    image: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center",
        className
      )}
    >
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || "User"}
          className="h-full w-full rounded-full object-cover"
        />
      ) : user.name ? (
        <span className="text-xs font-medium">
          {user.name[0]?.toUpperCase()}
        </span>
      ) : (
        <User className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}
