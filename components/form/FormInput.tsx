import { Input } from "../ui/input";
import { Label } from "../ui/label";

type FormInputProps = {
  name: string;
  type?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  step?: string;
};

export default function FormInput({
  name,
  type = "text",
  label,
  defaultValue,
  placeholder,
  step,
}: FormInputProps) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
      />
    </div>
  );
}
