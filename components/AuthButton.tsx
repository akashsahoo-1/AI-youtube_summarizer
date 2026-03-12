"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="w-24 h-10 bg-zinc-800 animate-pulse rounded-lg"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {user.user_metadata?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.full_name || "User avatar"} 
              className="w-8 h-8 rounded-full border border-zinc-700"
            />
          )}
          <span className="text-sm font-medium hidden sm:block">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <button
          onClick={signOut}
          className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm hidden sm:block">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors text-sm"
    >
      Sign in with Google
    </button>
  );
}
