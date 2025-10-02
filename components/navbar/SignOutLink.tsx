"use client";
import { useToast } from "@/hooks/use-toast";
import { SignOutButton } from "@clerk/nextjs";

export default function SignOutLink() {
  const { toast } = useToast();
  const handleLogout = () => {
    toast({ description: "You have been signed out." });
  };

  return (
    <SignOutButton redirectUrl="/">
      <button className="w-full text-left" onClick={handleLogout}>
        Logout
      </button>
    </SignOutButton>
  );
}
