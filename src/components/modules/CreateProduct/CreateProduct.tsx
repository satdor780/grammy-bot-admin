import { useCallback, useRef, useState } from "react";
import {
  CropImage,
  type CropImageRef,
} from "../../widgets/CropImage/CropImage";
import { Button } from "../../shadcn/ui/button";
import { Fields } from "./components";
import { PlusIcon } from "lucide-react";
import { useCreateProductStore, useTelegramStore } from "../../../store";
import { useDebugStore } from "../../../store/debugStore";
import { useUploadImage } from "../../../hooks/useUploadImage";
import { useCreateProduct } from "../../../hooks/useCreateProduct";
import { dataURLtoBlob } from "../../../lib/utils";

const HIDDEN_INPUT_STYLE = { display: "none" as const };
const PREVIEW_IMG_STYLE = { maxWidth: 200 };
const DEFAULT_PRODUCT_TYPE = "custom" as const;

export const CreateProduct = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const cropRef = useRef<CropImageRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initData = useTelegramStore((s) => s.initData);
  const addError = useDebugStore((s) => s.addError);
  const addResponse = useDebugStore((s) => s.addResponse);
  const getSubmitPayload = useCreateProductStore((s) => s.getSubmitPayload);
  const reset = useCreateProductStore((s) => s.reset);
  const setSubmitAttempted = useCreateProductStore((s) => s.setSubmitAttempted);
  const canSubmit = useCreateProductStore((s) => {
    const has = (v: string) => v.trim() !== "";
    const num = (v: string) =>
      v.trim() !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0;
    return (
      has(s.name) &&
      has(s.slug) &&
      has(s.shortDescription) &&
      has(s.description) &&
      num(s.price)
    );
  });

  const uploadMutation = useUploadImage({
    onSuccess: (data) => {
      addResponse("Image uploaded", data, "uploadImage");
    },
    onError: (err) => {
      addError(err.message ?? "Image upload failed", { error: String(err) }, "uploadImage");
    },
  });
  const createMutation = useCreateProduct({
    onSuccess: (data) => {
      addResponse("Product created", data, "createProduct");
      reset();
      setSelectedImage(null);
      setCroppedImage(null);
      setSubmitError(null);
    },
    onError: (err) => {
      const msg = err.message ?? "Failed to create product";
      addError(msg, { error: String(err) }, "createProduct");
      setSubmitError(msg);
    },
  });

  const isSubmitting = uploadMutation.isPending || createMutation.isPending;

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitAttempted(true);
      return;
    }
    if (!initData) {
      const msg = "Telegram initData is required. Open from Telegram.";
      addError(msg, undefined, "validation");
      setSubmitError(msg);
      return;
    }

    const cropped = await cropRef.current?.getCroppedImage();
    if (!cropped) {
      const msg = "Please select and crop an image.";
      addError(msg, undefined, "validation");
      setSubmitError(msg);
      setSubmitAttempted(true);
      return;
    }
    setCroppedImage(cropped);

    const payload = getSubmitPayload();
    if (payload.price < 0.01) {
      const msg = "Price must be at least 0.01";
      addError(msg, { price: payload.price }, "validation");
      setSubmitError(msg);
      return;
    }

    try {
      const blob = dataURLtoBlob(cropped);
      const uploadRes = await uploadMutation.mutateAsync({
        imageFile: blob,
        initData,
      });
      const imageUrl = uploadRes.url;

      await createMutation.mutateAsync({
        initData,
        type: DEFAULT_PRODUCT_TYPE,
        title: payload.name,
        slug: payload.slug,
        image: imageUrl,
        shortDescription: payload.shortDescription,
        fullDescription: payload.description,
        basePrice: payload.price,
        available: 0,
        tags: payload.tags,
        discounts: payload.discounts,
      });

      
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit product";
      addError(msg, err instanceof Error ? { stack: err.stack } : undefined, "submit");
      setSubmitError(msg);
    }
  }, [
    canSubmit,
    initData,
    addError,
    getSubmitPayload,
    setSubmitAttempted,
    uploadMutation,
    createMutation,
  ]);

  const user = useTelegramStore((s) => s.user);

  return (
    <form className="mx-auto w-full p-3 pb-[70px]">
      <h1 className="text-2xl font-semibold tracking-tight pb-2">
        Create Product <span>user: {user?.first_name}</span>
      </h1>

      <div
        className="w-full h-[200px] bg-[#101010] mb-3 flex items-center justify-center"
        onClick={handleUploadClick}
      >
        {selectedImage ? (
          <>
            <CropImage
              ref={cropRef}
              src={selectedImage}
              orientation={1}
              cropOnChange={false}
            />
          </>
        ) : (
          <div className="w-[60px] h-[60px] bg-[#161616] flex items-center justify-center">
            <PlusIcon />
          </div>
        )}
      </div>

      <Fields />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={HIDDEN_INPUT_STYLE}
      />
      {croppedImage && (
        <div>
          <p>Cropped preview:</p>
          <img src={croppedImage} alt="Cropped" style={PREVIEW_IMG_STYLE} />
        </div>
      )}
      {submitError && (
        <p className="text-sm text-destructive mt-2" role="alert">
          {submitError}
        </p>
      )}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full my-3 fixed max-w-[calc(100%-30px)] -translate-x-2/4 left-2/4 bottom-2.5"
        style={{ opacity: !canSubmit || isSubmitting ? 0.5 : 1 }}
      >
        {isSubmitting ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
};
