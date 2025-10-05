import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FramedAvatarProps {
  avatarUrl?: string;
  frameUrl?: string;
  username: string;
  size?: number;
}

export default function FramedAvatar({ avatarUrl, frameUrl, username, size = 40 }: FramedAvatarProps) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <Avatar style={{ width: size, height: size }}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      {frameUrl && (
        <img
          src={frameUrl}
          alt="frame"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
