import { getRAGStatus } from "@repo/rag-core";

export default function Home() {
  const status = getRAGStatus();

  return (
    <>
      <div className="flex flex-col justify-center items-center h-[100vh] font-sans">
        <h1 className="text-4xl font-semibold">{status.message}</h1>
        <p>Satus: {status.isReady ? "Ready" : "Not Ready"}</p>
      </div>
    </>
  );
}
