import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const [user, settings] = await Promise.all([
    getCurrentUser(),
    getPublicSettings(),
  ]);
  if (user) redirect(roleHome(user.role));

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden border border-ink-950/12 bg-white/72 md:grid-cols-[1fr_0.9fr]">
        <div className="bg-ink-950 p-8 text-linen md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-clay">
            {settings.siteName}
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight md:text-6xl">
            {settings.siteSubtitle}
          </h1>
        </div>
        <div className="p-6 md:p-10">
          <h2 className="text-2xl font-black text-ink-950">登录</h2>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
