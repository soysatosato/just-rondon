import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function ImageInput({
  multiple = false,
  name = "image",
}: {
  name?: string;
  multiple?: boolean;
}) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Image
      </Label>
      <Input
        id={name}
        name={name}
        multiple={multiple}
        type="file"
        required
        accept="image/*"
        className="max-w-xs"
      />
    </div>
  );
}
