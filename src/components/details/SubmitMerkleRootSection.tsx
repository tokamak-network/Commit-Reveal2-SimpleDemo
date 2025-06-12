"use client";

export default function SubmitMerkleRootSection({
  merkleRoot,
}: {
  merkleRoot: string | null;
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Submit a Merkle Root</h3>
      <div className="mb-4">
        <p>
          <span className="font-semibold">Merkle Root:</span>{" "}
          {merkleRoot ? (
            <span className="font-mono">{merkleRoot}</span>
          ) : (
            <span className="text-gray-500 italic">Not submitted yet</span>
          )}
        </p>
      </div>
    </div>
  );
}
