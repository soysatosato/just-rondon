import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type TextAreaInputProps = {
  name: string;
  labelText?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
};

export default function TextAreaInput({
  name,
  labelText,
  defaultValue = "",
  placeholder = "ここに本文を入力",
  rows = 5,
}: TextAreaInputProps) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        {labelText || name}
      </Label>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className="leading-loose"
      />
    </div>
  );
}
