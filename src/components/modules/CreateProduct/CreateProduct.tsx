import { useCallback, useRef, useState } from "react";
import { CropImage, type CropImageRef } from "../../widgets/CropImage/CropImage";
import { Button } from "../../shadcn/ui/button";
import { Fields } from "./components";

const HIDDEN_INPUT_STYLE = { display: "none" as const };
const PREVIEW_IMG_STYLE = { maxWidth: 200 };

export const CreateProduct = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropRef = useRef<CropImageRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    []
  );

  const handleSubmit = useCallback(async () => {
    const cropped = await cropRef.current?.getCroppedImage();
    if (cropped) setCroppedImage(cropped);
  }, []);

  return (
    <form className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>

      <Fields />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={HIDDEN_INPUT_STYLE}
      />
      <Button type="button" onClick={handleUploadClick}>
        Upload photo
      </Button>
      {selectedImage && (
        <>
          <CropImage
            ref={cropRef}
            src={selectedImage}
            orientation={1}
            cropOnChange={false}
          />
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </>
      )}
      {croppedImage && (
        <div>
          <p>Cropped preview:</p>
          <img src={croppedImage} alt="Cropped" style={PREVIEW_IMG_STYLE} />
        </div>
      )}
    </form>
  );
};
