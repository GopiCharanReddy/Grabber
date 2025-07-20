interface Props { message?: string }
export default function ErrorMessage({ message }: Props) {
  if (!message) return null;
  return <div className="text-red-600 text-sm my-2 text-center">{message}</div>;
} 