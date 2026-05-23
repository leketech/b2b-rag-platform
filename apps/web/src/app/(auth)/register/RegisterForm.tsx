"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState<RegisterState>({ status: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setState({ status: "loading", message: "" });

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        organization: formData.get("organization"),
        password,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.detail ?? "Could not create the workspace. Please try again.",
      });
      return;
    }

    const loginResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginPayload = await loginResponse.json().catch(() => ({}));

    if (loginResponse.ok) {
      window.localStorage.setItem("access_token", loginPayload.access_token);
      window.localStorage.setItem("organization_id", loginPayload.organization_id);
      window.localStorage.setItem("organization_name", loginPayload.organization_name);
      window.localStorage.setItem("email", loginPayload.email);
      router.push("/dashboard");
      return;
    }

    setState({
      status: "success",
      message: `${payload.organization_name} was created. Please log in to continue.`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <input
        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
        name="email"
        placeholder="Work email"
        required
        type="email"
      />
      <input
        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
        name="organization"
        placeholder="Organization name"
        required
      />
      <input
        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
        minLength={8}
        name="password"
        placeholder="Password (min 8 characters)"
        required
        type="password"
      />
      <button
        className="h-11 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? "Creating workspace..." : "Create workspace"}
      </button>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-400" : "text-emerald-400"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
