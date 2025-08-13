import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <ProfileView />
      </div>
    </div>
  );
}
