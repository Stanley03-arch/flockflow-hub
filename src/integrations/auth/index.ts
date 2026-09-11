import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
};

export const auth = {
  signInWithOAuth: async (
    provider: "google" | "apple" | "azure",
    opts?: SignInOptions,
  ) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: opts?.redirect_uri,
      },
    });

    if (error) {
      return { error, redirected: false as const };
    }

    // Browser will navigate when a URL is returned
    if (data?.url) {
      window.location.href = data.url;
      return { redirected: true as const };
    }

    return { redirected: false as const };
  },
};
