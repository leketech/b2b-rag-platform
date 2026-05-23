"use client";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type LocalProfile = {
  email: string;
  organizationName: string;
};

export function UserDropdown() {
  const [localProfile, setLocalProfile] = useState<LocalProfile>({
    email: "",
    organizationName: "Workspace",
  });

  useEffect(() => {
    setLocalProfile({
      email: window.localStorage.getItem("email") || "",
      organizationName: window.localStorage.getItem("organization_name") || "Workspace",
    });
  }, []);

  const profile = useMemo(() => {
    const email = localProfile.email || "Signed in";
    const name = localProfile.organizationName || "Workspace";
    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U";

    return { email, name, initials };
  }, [localProfile]);

  function handleLogout() {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("organization_id");
    window.localStorage.removeItem("organization_name");
    window.localStorage.removeItem("email");
    window.location.href = "/";
  }

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-xs font-semibold text-emerald-700">
          {profile.initials}
        </div>
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </summary>
      <div className="absolute right-0 top-12 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-soft">
        <div className="border-b border-zinc-100 px-3 py-2">
          <p className="truncate text-sm font-medium text-zinc-950">{profile.name}</p>
          <p className="truncate text-xs text-zinc-500">{profile.email}</p>
        </div>
        <button className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
          <UserRound className="h-4 w-4" />
          Profile
        </button>
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
          <Settings className="h-4 w-4" />
          Preferences
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </details>
  );
}

export default UserDropdown;
