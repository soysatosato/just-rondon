// components/form/CheckboxInput.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  name: string;
  label: string;
  defaultChecked?: boolean;
}

export default function CheckboxInput({ name, label, defaultChecked }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={name} name={name} defaultChecked={defaultChecked} />
      <Label htmlFor={name}>{label}</Label>
    </div>
  );
}
