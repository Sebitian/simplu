import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>Simplu</Link>
        </div>
        
        {user ? (
          // Authenticated navbar: Simplu, Workouts, Chat, Logout, Avatar
          <>
            <div className="flex gap-6 items-center">
              <Link href={"/workouts"} className="hover:underline">
                Workouts
              </Link>
              <Link href={"/test-google"} className="hover:underline">
                Chat
              </Link>
            </div>
            <div className="flex gap-4 items-center">
              <LogoutButton />
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </>
        ) : (
          // Unauthenticated navbar: just Sign-in button
          <div className="flex gap-2">
            <Button asChild size="sm" variant={"outline"}>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
