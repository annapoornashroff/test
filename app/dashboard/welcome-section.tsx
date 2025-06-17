import { type UserProfile } from '@/lib/types/api';

interface WelcomeSectionProps {
  userName: string | undefined;
}

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div>
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
        Welcome back, {userName || 'there'}! 👋
      </h2>
      <p className="text-gray-600">
        Let&apos;s continue planning your dream wedding
      </p>
    </div>
  );
} 