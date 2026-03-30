'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/get-cropped-img';
import { Loader2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

// Cover image aspect ratio: 1200×630 ≈ 1.905
const ASPECT_RATIO = 1200 / 630;

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);
      onCropComplete(croppedFile, previewUrl);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem de Capa</DialogTitle>
          <DialogDescription>
            Arraste e use o zoom para enquadrar a imagem no tamanho ideal
            (1200×630px).
          </DialogDescription>
        </DialogHeader>

        {/* Crop Area */}
        <div className="relative w-full h-[350px] bg-black/90 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid
            style={{
              containerStyle: {
                borderRadius: '0.5rem',
              },
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3 px-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={(vals) => setZoom(vals[0])}
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="ml-2 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Resetar
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isCropping}
          >
            {isCropping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recortando...
              </>
            ) : (
              'Confirmar Recorte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
