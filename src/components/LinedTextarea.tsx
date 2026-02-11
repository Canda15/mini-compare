// components/LinedTextarea.tsx
import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ScrollPosition {
  top: number;
  left: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  syncId?: string;
  syncSourceId?: string | null;
  syncPosition?: ScrollPosition;
  onScrollPositionChange?: (sourceId: string, position: ScrollPosition) => void;
}

export default function LinedTextarea({
  value,
  onChange,
  placeholder,
  className,
  syncId,
  syncSourceId,
  syncPosition,
  onScrollPositionChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const suppressScrollEventRef = useRef(false);

  const lines = value.split("\n").length;
  const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join("\n");

  useEffect(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (!ta || !gutter) return;

    const handleScroll = () => {
      gutter.scrollTop = ta.scrollTop;
      if (suppressScrollEventRef.current || !syncId || !onScrollPositionChange) {
        return;
      }
      onScrollPositionChange(syncId, {
        top: ta.scrollTop,
        left: ta.scrollLeft,
      });
    };

    ta.addEventListener("scroll", handleScroll);
    return () => ta.removeEventListener("scroll", handleScroll);
  }, [onScrollPositionChange, syncId]);

  useEffect(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (!ta || !gutter || !syncPosition || !syncId || syncSourceId === syncId) {
      return;
    }

    if (ta.scrollTop === syncPosition.top && ta.scrollLeft === syncPosition.left) {
      return;
    }

    suppressScrollEventRef.current = true;
    ta.scrollTop = syncPosition.top;
    ta.scrollLeft = syncPosition.left;
    gutter.scrollTop = syncPosition.top;

    requestAnimationFrame(() => {
      suppressScrollEventRef.current = false;
    });
  }, [syncId, syncPosition, syncSourceId]);

  return (
    <div className="relative flex h-full min-h-0 font-mono text-sm border rounded overflow-hidden bg-white">
      <div
        ref={gutterRef}
        className="h-full shrink-0 bg-gray-100 text-gray-500 text-right px-2 py-2 whitespace-pre select-none leading-5 overflow-hidden min-w-[2.5rem]"
      >
        {lineNumbers}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`field-sizing-fixed h-full min-h-0 overflow-auto resize-none border-none rounded-none focus-visible:ring-0 focus-visible:outline-none leading-5 ${
          className ?? ""
        }`}
      />
    </div>
  );
}
