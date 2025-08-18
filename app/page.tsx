import { ThemeSwitcher } from "@/components/theme-switcher";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
            {!user ? (
              // Generic welcome page for unauthenticated users
              <div className="flex flex-col items-center justify-center text-center space-y-8 py-20">
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to Simplu
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Your comprehensive fitness tracking and workout planning platform. 
                  Create custom workouts, track your progress, and achieve your fitness goals.
                </p>
                <div className="flex gap-4 mt-8">
                  <a 
                    href="/auth/sign-up"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Get Started
                  </a>
                  <a 
                    href="/auth/login"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Sign In
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
                  <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Custom Workouts</h3>
                    <p className="text-muted-foreground">
                      Create personalized workout plans tailored to your fitness goals and preferences.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Progress Tracking</h3>
                    <p className="text-muted-foreground">
                      Monitor your fitness journey with detailed analytics and progress visualization.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">AI Assistant</h3>
                    <p className="text-muted-foreground">
                      Get personalized workout advice and nutrition guidance from our AI chat assistant.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Authenticated user content (can be customized later)
              <div className="flex flex-col items-center justify-center text-center space-y-8 py-20">
                <h1 className="text-3xl font-bold">Welcome back!</h1>
                <p className="text-lg text-muted-foreground">
                  Ready to continue your fitness journey?
                </p>
                <div className="flex gap-4">
                  <a 
                    href="/workouts"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    View Workouts
                  </a>
                  <a 
                    href="/test-google"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Chat Assistant
                  </a>
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}