import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import DiffViewer, { DiffResult } from "./DiffViewer";
import LinedTextarea from "@/components/LinedTextarea";

interface ScrollPosition {
  top: number;
  left: number;
}

export default function App() {
  const [left, setLeft] = useState("Hello world\nThis is left");
  const [right, setRight] = useState("Hello Word!\nThis is right");
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputScrollState, setInputScrollState] = useState<{
    sourceId: string | null;
    position: ScrollPosition;
  }>({
    sourceId: null,
    position: { top: 0, left: 0 },
  });
  const requestIdRef = useRef(0);

  const handleInputScrollSync = useCallback(
    (sourceId: string, position: ScrollPosition) => {
      setInputScrollState((prev) => {
        if (
          prev.sourceId === sourceId &&
          prev.position.top === position.top &&
          prev.position.left === position.left
        ) {
          return prev;
        }
        return { sourceId, position };
      });
    },
    [],
  );

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    let disposed = false;

    const timer = window.setTimeout(() => {
      const fetchDiff = async () => {
        try {
          const result = await invoke<DiffResult>("diff_texts", { left, right });
          if (disposed || currentRequestId !== requestIdRef.current) {
            return;
          }
          setDiff(result);
          setError(null);
        } catch (err) {
          if (disposed || currentRequestId !== requestIdRef.current) {
            return;
          }
          const message =
            err instanceof Error ? err.message : "Failed to generate diff.";
          setError(message);
        }
      };

      void fetchDiff();
    }, 120);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [left, right]);

  return (
    <div className="h-screen flex flex-col">
      <div className="h-[40vh] min-h-[220px] max-h-[60vh] grid grid-cols-2 gap-4 p-4 min-h-0 overflow-hidden">
        <LinedTextarea
          value={left}
          onChange={setLeft}
          placeholder="Left input"
          className="h-full min-h-0"
          syncId="left"
          syncSourceId={inputScrollState.sourceId}
          syncPosition={inputScrollState.position}
          onScrollPositionChange={handleInputScrollSync}
        />
        <LinedTextarea
          value={right}
          onChange={setRight}
          placeholder="Right input"
          className="h-full min-h-0"
          syncId="right"
          syncSourceId={inputScrollState.sourceId}
          syncPosition={inputScrollState.position}
          onScrollPositionChange={handleInputScrollSync}
        />
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}

      <div className="min-h-0 flex-1">{diff && <DiffViewer diff={diff} />}</div>
    </div>
  );
}
