"use client";

import { useFormStatus } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

export function Header({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden text-sm text-muted-foreground sm:inline"
            title={userEmail}
          >
            {userEmail}
          </span>
          <form action={signOut}>
            <LogoutButton />
          </form>
        </div>
      </div>
    </header>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label="Sair"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Sair</span>
    </Button>
  );
}
