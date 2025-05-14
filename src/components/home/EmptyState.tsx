"use client";

export default function EmptyState({ message }: { message: string }) {
  return (
    <h2 className="text-xl text-zinc-600 bg-white/70 p-4 rounded-xl">
      {message}
    </h2>
  );
}
