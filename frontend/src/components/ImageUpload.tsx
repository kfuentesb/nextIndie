import { useRef, type ChangeEvent, type CSSProperties } from "react";
import { useImageUpload, type ImageUploadConfig } from "../hooks/useImageUpload";

export interface ImageUploadFieldConfig extends ImageUploadConfig {
  label: string;
  helpText?: string;
  maxHeight?: number;
  maxWidth?: number;
}

export type { ImageUploadState, ImageUploadHandlers } from "../hooks/useImageUpload";

const DEFAULT_MAX_HEIGHT = 220;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface ImageUploadFieldProps extends ImageUploadFieldConfig {
  disabled?: boolean;
  saving?: boolean;
  valueUrl?: string | null;
  externalError?: string | null;
  onChange?: (file: File | null, fieldName: string) => void;
}

export default function ImageUploadField({
  label,
  helpText,
  fieldName,
  maxSizeMB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxHeight = DEFAULT_MAX_HEIGHT,
  maxWidth,
  disabled = false,
  saving = false,
  valueUrl,
  externalError,
  onChange,
}: ImageUploadFieldProps) {
  const [state, handlers] = useImageUpload({
    fieldName,
    maxSizeMB,
    acceptedTypes,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handlers.onFileSelect(file);
    onChange?.(file, fieldName);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClear = () => {
    handlers.onClear();
    onChange?.(null, fieldName);
  };

  const acceptString = acceptedTypes.join(",");
  const isDisabled = disabled || saving;
  const previewUrl = state.previewUrl || valueUrl || null;

  const imageStyle: CSSProperties = {
    maxHeight: `${maxHeight}px`,
    objectFit: "contain",
    ...(maxWidth && { maxWidth: `${maxWidth}px` }),
  };

  return (
    <div className="upload-field">
      <label className="form-label">
        <span>{label}</span>
        {state.file && <span className="upload-badge">Nuevo archivo</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        className={`form-input ${state.error || externalError ? "is-invalid" : ""}`}
        onChange={handleFileChange}
        disabled={isDisabled}
        name={fieldName}
      />

      {helpText && <div className="form-text mt-2">{helpText}</div>}

      {(state.error || externalError) && (
        <div className="invalid-feedback d-block mt-1">{state.error || externalError}</div>
      )}

      {previewUrl ? (
        <div className="upload-preview">
          <img src={previewUrl} alt={label} className="upload-image" style={imageStyle} />
          {!isDisabled && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Quitar imagen
            </button>
          )}
        </div>
      ) : (
        <div className="upload-empty">No hay imagen seleccionada</div>
      )}
    </div>
  );
}