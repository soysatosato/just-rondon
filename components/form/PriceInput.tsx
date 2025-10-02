import { Input } from "../ui/input";
import { Label } from "../ui/label";

type props = {
  name?: string;
  label?: string;
  defaultValue?: number;
};

export default function PriceInput({
  name = "price",
  defaultValue,
  label = "Price",
}: props) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        step={0.01}
        defaultValue={defaultValue || 0}
        required
        className="max-w-xs"
      />
    </div>
  );
}
