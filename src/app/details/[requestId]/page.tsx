"use client";

import { use } from "react";
import RequestDetailClient from "../../../components/details/RequestDetailClient";

export default function Page({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);

  return <RequestDetailClient requestId={requestId} />;
}
