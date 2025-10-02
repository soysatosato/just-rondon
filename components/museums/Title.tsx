export default function Title({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return <h3 className={`text-lg font-bold ${className}`}>{text}</h3>;
}
