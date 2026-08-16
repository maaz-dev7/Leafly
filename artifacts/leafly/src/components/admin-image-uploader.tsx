import { useState, useRef, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Two-step presigned-URL upload — no external deps */
export function useImageUpload(onUploaded: (imageUrl: string) => void) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const metaRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "image/jpeg" }),
      });
      if (!metaRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await metaRes.json();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      onUploaded(`/api/storage${objectPath}`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return { upload, uploading, uploadError };
}

/** Single image uploader — file pick or drag, no URL input */
export function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(value);
  const { upload, uploading, uploadError } = useImageUpload((url) => {
    onChange(url);
    setPreview(url);
  });

  const handleFile = (file: File) => {
    setPreview(URL.createObjectURL(file));
    upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreview("");
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer
          ${uploading ? "opacity-60 pointer-events-none" : "hover:border-[#4A7C3F] hover:bg-[#EDF4E9]/40"}
          ${preview ? "border-[#4A7C3F]/40 bg-[#EDF4E9]/20 p-1.5" : "border-muted-foreground/25 bg-muted/30 p-6"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-32 w-full rounded-lg object-contain bg-white" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                <span className="text-xs font-medium text-[#1B3D2A]">Uploading…</span>
              </div>
            )}
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-0.5 shadow hover:bg-white"
            >
              <X size={12} className="text-[#1B3D2A]" />
            </button>
          </>
        ) : (
          <>
            <UploadCloud size={22} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              {uploading ? "Uploading…" : "Click or drag image"}
            </p>
          </>
        )}
      </div>
      {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

/** Multi-slot uploader — shows N slots, fills from left */
export function MultiImageUploader({
  values,
  onChange,
  max = 4,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const slots = Array.from({ length: max }, (_, i) => values[i] ?? "");

  const updateSlot = (i: number, url: string) => {
    const next = [...slots];
    next[i] = url;
    onChange(next.filter(Boolean));
  };

  return (
    <div className={`grid gap-3 ${max <= 2 ? "grid-cols-2" : max <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {slots.map((val, i) => (
        <ImageUploader
          key={i}
          value={val}
          onChange={(url) => updateSlot(i, url)}
          label={i === 0 ? "Photo 1" : `Photo ${i + 1}`}
        />
      ))}
    </div>
  );
}
