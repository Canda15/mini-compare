import React from "react";

export type SegmentKind = "equal" | "delete" | "insert";

export interface DiffSegment {
  text: string;
  kind: SegmentKind;
}

export interface DiffLine {
  segments: DiffSegment[];
  changed: boolean;
}

export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
}

interface Props {
  diff: DiffResult;
}

type Side = "left" | "right";

function renderSegments(segments: DiffSegment[], side: Side) {
  const hasVisibleText = segments.some((segment) => segment.text.length > 0);
  if (!hasVisibleText) {
    return "\u00A0";
  }

  return segments.map((segment, idx) => {
    let tokenClassName = "";
    if (segment.kind === "delete" && side === "left") {
      tokenClassName = "bg-red-300/80";
    } else if (segment.kind === "insert" && side === "right") {
      tokenClassName = "bg-yellow-300/80";
    }

    return (
      <span className={tokenClassName} key={`${segment.kind}-${idx}`}>
        {segment.text}
      </span>
    );
  });
}

const DiffViewer: React.FC<Props> = ({ diff }) => {
  const leftPaneRef = React.useRef<HTMLDivElement>(null);
  const rightPaneRef = React.useRef<HTMLDivElement>(null);
  const syncingFromRef = React.useRef<Side | null>(null);
  const maxLines = Math.max(diff.left.length, diff.right.length);

  const syncPaneScroll = (source: Side) => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    if (!leftPane || !rightPane) {
      return;
    }

    if (syncingFromRef.current && syncingFromRef.current !== source) {
      return;
    }

    const sourcePane = source === "left" ? leftPane : rightPane;
    const targetPane = source === "left" ? rightPane : leftPane;

    syncingFromRef.current = source;
    targetPane.scrollTop = sourcePane.scrollTop;
    targetPane.scrollLeft = sourcePane.scrollLeft;

    requestAnimationFrame(() => {
      if (syncingFromRef.current === source) {
        syncingFromRef.current = null;
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-full font-mono text-sm">
      <div
        ref={leftPaneRef}
        className="overflow-auto bg-gray-100 rounded p-2 border"
        onScroll={() => syncPaneScroll("left")}
      >
        <table className="w-full table-fixed">
          <tbody>
            {Array.from({ length: maxLines }).map((_, i) => {
              const leftLine = diff.left[i];
              const rightLine = diff.right[i];
              const isDiff = Boolean(leftLine?.changed || rightLine?.changed);

              return (
                <tr key={`left-${i}`} className={isDiff ? "bg-red-50" : ""}>
                  <td className="w-8 pr-2 text-right text-gray-400">{i + 1}</td>
                  <td className="whitespace-pre-wrap break-words">
                    {renderSegments(leftLine?.segments ?? [], "left")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        ref={rightPaneRef}
        className="overflow-auto bg-gray-100 rounded p-2 border"
        onScroll={() => syncPaneScroll("right")}
      >
        <table className="w-full table-fixed">
          <tbody>
            {Array.from({ length: maxLines }).map((_, i) => {
              const leftLine = diff.left[i];
              const rightLine = diff.right[i];
              const isDiff = Boolean(leftLine?.changed || rightLine?.changed);

              return (
                <tr key={`right-${i}`} className={isDiff ? "bg-red-50" : ""}>
                  <td className="w-8 pr-2 text-right text-gray-400">{i + 1}</td>
                  <td className="whitespace-pre-wrap break-words">
                    {renderSegments(rightLine?.segments ?? [], "right")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiffViewer;
