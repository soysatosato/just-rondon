import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMuseums } from "@/utils/actions/museums";

type props = {
  name: string;
  labelText?: string;
  defaultValue?: string;
};

export default async function MuseumInput({
  name,
  labelText,
  defaultValue,
}: props) {
  const museums = await fetchMuseums();
  return (
    <div className="mb-2 max-w-xs">
      <Label htmlFor={name} className="capitalize">
        {labelText || name}
      </Label>
      <Select
        name={name}
        required
        defaultValue={defaultValue || museums[0].name}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {museums.map((museum) => (
            <SelectItem key={museum.id} value={museum.id}>
              {museum.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
