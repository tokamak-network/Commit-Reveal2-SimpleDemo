import { use } from "react";
import RequestDetailClient from "./RequestDetailClient";

export default function Page({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);

  return <RequestDetailClient requestId={requestId} />;
}
