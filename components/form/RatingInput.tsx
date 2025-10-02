import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type props = {
  name: string;
};

export default function RatingInput({ name }: props) {
  //   出力される配列	["1", "2", "3", "4", "5"]
  const number = Array.from({ length: 5 }, (_, i) => {
    const value = i + 1;
    return value.toString();
  }).reverse();
  return (
    <div>
      <Select name={name} required>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="⭐評価" />
        </SelectTrigger>
        <SelectContent
          side="top"
          position="popper"
          avoidCollisions={false}
          className="overflow-y-auto"
        >
          {number.map((i) => (
            <SelectItem className="text-sm h-5" key={i} value={i}>
              {i}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
