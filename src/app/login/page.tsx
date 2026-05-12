/**
 * /login route. Thin server-component wrapper that streams the real
 * <LoginForm> (a client component) inside a Suspense boundary so the
 * page renders immediately even before form JS is hydrated.
 */
import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-16">
      <p className="text-sm text-slate-500" role="status">
        Loading…
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
