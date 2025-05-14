"use client";

export default function EmptyStateMessage() {
  return (
    <div className="flex items-start justify-start mt-4">
      <p className="text-gray-500 italic">
        No information is available for this request ID.
      </p>
    </div>
  );
}
