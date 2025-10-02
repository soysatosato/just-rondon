"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { IoReload, IoReloadCircle } from "react-icons/io5";
import { SignInButton } from "@clerk/nextjs";
import { FaRegHeart, FaHeart, FaPenSquare } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";

type btnSize = "default" | "lg" | "sm";

type SubmitButtonProps = {
  className?: string;
  text?: string;
  size?: btnSize;
};

export function SubmitButton({
  className = "",
  text = "submit",
  size = "lg",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      className={`capitalize ${className}`}
      size={size}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <IoReload className="mr-4 h-4 w-4 animate-spin" />
          Please wait ...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export const CardSignInButton = () => {
  return (
    <SignInButton mode="modal">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="p-2 cursor-pointer"
        asChild
      >
        <FaRegHeart />
      </Button>
    </SignInButton>
  );
};

export const CardSubmitButton = ({ isFavorite }: { isFavorite: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="outline"
      className="p-2 cursor-pointer disabled:opacity-50"
      disabled={pending}
      aria-label={
        pending
          ? "読み込み中…"
          : isFavorite
          ? "お気に入り解除"
          : "お気に入り登録"
      }
    >
      {pending ? (
        <IoReload className="animate-spin text-blue-500" />
      ) : isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  );
};

type actionType = "edit" | "delete";
export const IconButton = ({ actionType }: { actionType: actionType }) => {
  const { pending } = useFormStatus();
  const renderIcon = () => {
    switch (actionType) {
      case "edit":
        return <FaPenSquare />;
      case "delete":
        return <LuTrash2 />;
      default:
        const never: never = actionType;
        throw new Error(`Invalid action type: ${never}`);
    }
  };
  return (
    <Button
      type="submit"
      size="icon"
      variant="link"
      className="p-2 cursor-pointer"
      disabled={pending}
    >
      {pending ? (
        <IoReloadCircle className="animate-spin rounded-full p-1 shadow-lg" />
      ) : (
        renderIcon()
      )}
    </Button>
  );
};
