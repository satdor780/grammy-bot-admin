import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

const CROPPER_CONTAINER_STYLE = { position: 'relative' as const, height: 400 };

export type CropImageRef = {
  getCroppedImage: () => Promise<string | null>;
};

function createCroppedImage(imgCroppedArea: Area, imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgCroppedArea.width;
    canvas.height = imgCroppedArea.height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx?.drawImage(
        img,
        imgCroppedArea.x,
        imgCroppedArea.y,
        imgCroppedArea.width,
        imgCroppedArea.height,
        0,
        0,
        imgCroppedArea.width,
        imgCroppedArea.height
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

const CropImageBase = forwardRef<
  CropImageRef,
  {
    src: string;
    setNewImage?: (image: string) => void;
    orientation: number;
    cropOnChange?: boolean;
  }
>(function CropImage(
  { src, setNewImage, orientation, cropOnChange = false },
  ref
) {
  const [imgAfterCrop, setImgAfterCrop] = useState('');
  const innerRef = useRef<ImageCropperInnerRef | null>(null);

  useEffect(() => {
    if (cropOnChange && imgAfterCrop) {
      setNewImage?.(imgAfterCrop);
    }
  }, [cropOnChange, imgAfterCrop, setNewImage]);

  useImperativeHandle(
    ref,
    () => ({
      getCroppedImage: () =>
        innerRef.current?.getCroppedImage() ?? Promise.resolve(null),
    }),
    []
  );

  if (!src) return null;

  return (
    <ImageCropper
      innerRef={innerRef}
      image={src}
      setImgAfterCrop={setImgAfterCrop}
      cropOnChange={cropOnChange}
      aspectRatio={orientation}
    />
  );
});

CropImageBase.displayName = 'CropImage';
export const CropImage = memo(CropImageBase);

type ImageCropperInnerRef = {
  getCroppedImage: () => Promise<string | null>;
};

const isValidArea = (a: Area) =>
  a &&
  !Number.isNaN(a.width) &&
  !Number.isNaN(a.height) &&
  !Number.isNaN(a.x) &&
  !Number.isNaN(a.y);

function ImageCropper({
  image,
  aspectRatio,
  cropOnChange,
  setImgAfterCrop,
  innerRef,
}: {
  image: string;
  aspectRatio: number;
  cropOnChange: boolean;
  setImgAfterCrop: (img: string) => void;
  innerRef: React.MutableRefObject<ImageCropperInnerRef | null>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const skipNextRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const croppedAreaRef = useRef<Area | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingCropRef = useRef(crop);
  const pendingZoomRef = useRef(zoom);
  const cropAreaThrottleRef = useRef(0);
  const DEBOUNCE_MS = 300;
  const CROP_AREA_THROTTLE_MS = 100;

  useEffect(() => {
    skipNextRef.current = true;
    croppedAreaRef.current = null;
  }, [image, aspectRatio]);

  useEffect(() => {
    innerRef.current = {
      getCroppedImage: async () => {
        const area = croppedAreaRef.current;
        if (!area || !image) return null;
        return createCroppedImage(area, image);
      },
    };
    return () => {
      innerRef.current = null;
    };
  }, [image, innerRef]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const flushPending = useCallback(() => {
    setCrop(pendingCropRef.current);
    setZoom(pendingZoomRef.current);
    rafRef.current = null;
  }, []);

  const onCropChange = useCallback((c: { x: number; y: number }) => {
    pendingCropRef.current = c;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushPending);
    }
  }, [flushPending]);

  const onZoomChange = useCallback((z: number) => {
    pendingZoomRef.current = z;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushPending);
    }
  }, [flushPending]);

  const onCropAreaChange = useCallback(
    (_croppedAreaPercentage: Area, croppedAreaPixels: Area) => {
      if (!isValidArea(croppedAreaPixels)) return;
      const now = performance.now();
      if (
        croppedAreaRef.current === null ||
        now - cropAreaThrottleRef.current > CROP_AREA_THROTTLE_MS
      ) {
        cropAreaThrottleRef.current = now;
        croppedAreaRef.current = croppedAreaPixels;
      }
    },
    []
  );

  const onMediaLoaded = useCallback(() => setIsReady(true), []);

  const onCropComplete = useCallback(
    (_croppedAreaPercentage: Area, croppedAreaPixels: Area) => {
      if (!isReady) return;
      if (!isValidArea(croppedAreaPixels)) return;
      croppedAreaRef.current = croppedAreaPixels;
      if (skipNextRef.current) {
        skipNextRef.current = false;
        if (!cropOnChange) return;
      }
      if (cropOnChange) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          createCroppedImage(croppedAreaPixels, image).then(setImgAfterCrop);
        }, DEBOUNCE_MS);
      }
    },
    [isReady, image, cropOnChange, setImgAfterCrop]
  );

  return (
    <div className="cropper" style={CROPPER_CONTAINER_STYLE}>
      <Cropper
        image={image}
        aspect={aspectRatio}
        crop={crop}
        zoom={zoom}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropAreaChange={onCropAreaChange}
        onCropComplete={onCropComplete}
        onMediaLoaded={onMediaLoaded}
      />
    </div>
  );
}
