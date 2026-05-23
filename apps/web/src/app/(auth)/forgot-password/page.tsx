import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-950">Reset password</h1>
        <p className="mt-1 text-sm text-zinc-500">Send a secure reset link to your work email.</p>
        <div className="mt-6 space-y-4">
          <input className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" placeholder="Email" />
          <button className="h-10 w-full rounded-lg bg-zinc-950 text-sm font-medium text-white">Send reset link</button>
        </div>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-indigo-700">Back to login</Link>
      </section>
    </main>
  );
}
