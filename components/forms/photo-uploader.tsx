"use client";

import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export interface UploadedPhoto {
  id: string;
  /** Local preview (blob:) or, for saved photos, the stored image URL. */
  url: string;
  name: string;
  /** Storage key once uploaded. */
  key?: string;
  status?: "uploading" | "done" | "error";
}

/** True while any photo is still uploading. */
export const photosUploading = (photos: UploadedPhoto[]) => photos.some((p) => p.status === "uploading");

/** True if any photo failed to upload. */
export const photosFailed = (photos: UploadedPhoto[]) => photos.some((p) => p.status === "error");

/** Only local previews hold object URLs that need releasing. */
const revoke = (url: string) => {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
};

/**
 * Preview grid for image uploads. With `upload`, each photo is uploaded as
 * soon as it's added and gets its storage `key`; without it, files stay
 * local previews.
 */
export function PhotoUploader({
  photos,
  onChange,
  upload,
  max = 10,
  showCover = true,
  invalid,
  label = "Add photos",
  describedBy,
}: {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  upload?: (file: File) => Promise<{ key: string }>;
  max?: number;
  showCover?: boolean;
  invalid?: boolean;
  label?: string;
  describedBy?: string;
}) {
  const inputId = useId();
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);

  // Revoke object URLs on unmount so we don't leak memory.
  useEffect(() => () => latest.current.forEach((p) => revoke(p.url)), []);

  // Uploads finish at different times, so each result is applied to the
  // newest list rather than the one from when it started.
  const apply = (update: (current: UploadedPhoto[]) => UploadedPhoto[]) => {
    latest.current = update(latest.current);
    onChange(latest.current);
  };

  const send = (photo: UploadedPhoto, file: File) => {
    upload!(file).then(
      ({ key }) => apply((ps) => ps.map((p) => (p.id === photo.id ? { ...p, key, status: "done" } : p))),
      () => apply((ps) => ps.map((p) => (p.id === photo.id ? { ...p, status: "error" } : p))),
    );
  };

  const add = (files: FileList | null) => {
    if (!files) return;
    const room = max - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .map((file) => ({
        file,
        photo: {
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          url: URL.createObjectURL(file),
          name: file.name,
          ...(upload && { status: "uploading" as const }),
        },
      }));
    apply((ps) => [...ps, ...picked.map((p) => p.photo)]);
    if (upload) picked.forEach(({ photo, file }) => send(photo, file));
  };

  const remove = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) revoke(photo.url);
    apply((ps) => ps.filter((p) => p.id !== id));
  };

  const makeCover = (id: string) => {
    const photo = photos.find((p) => p.id === id)!;
    apply((ps) => [photo, ...ps.filter((p) => p.id !== id)]);
  };

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {photos.map((p, i) => (
          <li key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={p.url} alt={`Upload ${i + 1}: ${p.name}`} className={cn("h-full w-full object-cover", p.status === "uploading" && "opacity-60")} />
            {p.status === "uploading" && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 aria-hidden className="h-6 w-6 animate-spin text-white drop-shadow" />
                <span className="sr-only">Uploading photo {i + 1}</span>
              </span>
            )}
            {p.status === "error" && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-danger/80 p-1 text-center text-[11px] font-semibold text-white">
                <AlertCircle aria-hidden className="h-5 w-5" />
                Upload failed. Remove and try again.
              </span>
            )}
            {showCover && i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-foreground/85 px-2 py-0.5 text-[11px] font-semibold text-white">
                Cover
              </span>
            )}
            {showCover && i > 0 && (
              <button
                type="button"
                onClick={() => makeCover(p.id)}
                className="absolute bottom-1.5 left-1.5 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold opacity-100 focus-visible:outline-2 focus-visible:outline-brand sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                Make cover
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <X aria-hidden className="h-4 w-4" />
              <span className="sr-only">Remove photo {i + 1}</span>
            </button>
          </li>
        ))}
        {photos.length < max && (
          <li className={cn(photos.length === 0 && "col-span-3 sm:col-span-5")}>
            <label
              htmlFor={inputId}
              className={cn(
                "flex h-full min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm font-semibold text-brand transition-colors hover:bg-brand-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
                photos.length > 0 && "aspect-square",
                invalid ? "border-danger" : "border-brand/40",
              )}
            >
              <ImagePlus aria-hidden className="h-7 w-7" />+ {label}
              {photos.length === 0 && <span className="text-xs font-normal text-muted">Up to {max} photos</span>}
              <input
                id={inputId}
                type="file"
                accept="image/*"
                multiple
                aria-describedby={describedBy}
                className="sr-only"
                onChange={(e) => {
                  add(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      <p className="mt-2 text-xs text-muted">
        {photos.length}/{max} photos{showCover ? " · The first photo is your cover" : ""}
      </p>
    </div>
  );
}
