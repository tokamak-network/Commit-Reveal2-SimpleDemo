"use client";

interface Props {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        className="text-sm px-3 py-1 border rounded disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <span className="text-sm font-medium">{currentPage}</span>
      <button
        className="text-sm px-3 py-1 border rounded disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
