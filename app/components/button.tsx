"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
}

const Button: React.FC<ButtonProps> = ({
  label,
  disabled,
  outline,
  small,
  icon: Icon,
}) => {
  const router = useRouter();
  const params = useSearchParams();

  // Check if search params exist
  if (!params || params.toString().length === 0) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/")}
      disabled={disabled}
      className={`relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition
        ${outline ? "bg-white" : "bg-rose-500"}
        ${outline ? "border-black" : "border-rose-500"}
        ${outline ? "text-black" : "text-white"}
        ${small ? "py-1 px-4 text-sm" : "py-3 px-6 text-lg"} // Added px-6 for more padding on larger button
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}
        w-auto`} // Use w-auto so the button adjusts to the content width
    >
      {Icon && <Icon size={24} className="absolute left-4 top-3" />}
      {label}
    </button>
  );
};

export default Button;

