import { RegisterForm } from "@/components/authentication/register-form";
import { Logo } from "@/components/Logo";

export default function Page() {
  return (
    <div className="flex flex-col space-y-4 min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Logo variant="stacked" />
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
