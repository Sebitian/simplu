import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation Bar */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 flex-shrink-0">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <SidebarTrigger />
            <Link href={"/"}>Simplu</Link>
          </div>
          <div className="flex gap-5 items-center font-semibold">            
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>            
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full flex flex-col gap-20 items-center h-full">
          <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 w-full">
            <main className="flex-1 flex flex-col gap-6 px-4">
              {/* Your main content goes here */}
            </main>
          </div>

          <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16 flex-shrink-0">
            <ThemeSwitcher />
          </footer>
        </div>
      </div>
    </div>
  );
}
