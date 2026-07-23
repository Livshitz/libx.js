/**
 * Browser image compressor: File/Blob/dataURL in → compressed dataURL (+optional Blob) out.
 * Downscales to a max longest-edge, then walks a descending quality ladder and stops at
 * diminishing returns (or under an explicit byte budget). Pure decision logic is exposed
 * as static helpers so it stays unit-testable without a DOM; only compress() touches canvas.
 */
export class ImageCompressor {
    public options: ImageCompressorOptions;

    public constructor(options?: Partial<ImageCompressorOptions>) {
        this.options = { ...new ImageCompressorOptions(), ...options };
    }

    /** Scale (w,h) down so the longest edge fits maxEdge. Never upscales. */
    public static fitToMaxEdge(width: number, height: number, maxEdge: number): { width: number; height: number; scale: number } {
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), scale };
    }

    /** Descending quality ladder from max to min (inclusive), fixed step. */
    public static qualityLadder(maxQuality: number, minQuality: number, step: number): number[] {
        const ladder: number[] = [];
        for (let q = maxQuality; q > minQuality + 1e-9; q -= step) ladder.push(Math.round(q * 100) / 100);
        ladder.push(Math.round(minQuality * 100) / 100);
        return ladder;
    }

    /** Byte length of a base64 dataURL's payload (the wire/storage size). */
    public static dataUrlBytes(dataUrl: string): number {
        const comma = dataUrl.indexOf(',');
        const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
        let padding = 0;
        if (b64.endsWith('==')) padding = 2;
        else if (b64.endsWith('=')) padding = 1;
        return Math.floor((b64.length * 3) / 4) - padding;
    }

    /** First preferred mime the encoder actually supports (canvas silently falls back to png otherwise). */
    public static pickMime(preference: string[], isSupported: (mime: string) => boolean): string {
        for (const mime of preference) if (isSupported(mime)) return mime;
        return 'image/jpeg';
    }

    /**
     * Given encoded sizes so far (highest quality first), decide whether the latest step
     * is worth keeping: true = keep stepping down, false = previous step was good enough
     * (the latest step saved less than minGainRatio of the previous size).
     */
    public static isWorthStep(prevBytes: number, nextBytes: number, minGainRatio: number): boolean {
        if (prevBytes <= 0) return true;
        return (prevBytes - nextBytes) / prevBytes >= minGainRatio;
    }

    /**
     * Pure ladder walk over a byte-size oracle (quality → bytes). Returns the chosen quality.
     * With targetBytes: the highest quality that fits the budget (or minQuality's result).
     * Without: descends until savings hit diminishing returns.
     */
    public static selectQuality(ladder: number[], bytesAt: (q: number) => number, opts: { targetBytes?: number; minGainRatio: number }): { quality: number; bytes: number } {
        let prev: { quality: number; bytes: number } | null = null;
        for (const q of ladder) {
            const bytes = bytesAt(q);
            if (opts.targetBytes != null) {
                if (bytes <= opts.targetBytes) return { quality: q, bytes };
                prev = { quality: q, bytes };
                continue; // keep descending to fit budget
            }
            if (prev && !ImageCompressor.isWorthStep(prev.bytes, bytes, opts.minGainRatio)) return prev;
            prev = { quality: q, bytes };
        }
        return prev!;
    }

    /** Compress an image. Input: File/Blob or dataURL string. */
    public async compress(input: File | Blob | string): Promise<ImageCompressorResult> {
        const opts = this.options;
        const img = await this._decode(input);
        const { width, height } = ImageCompressor.fitToMaxEdge(img.width, img.height, opts.maxEdge);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

        // Canvas falls back to image/png silently when a mime is unsupported — probe for it.
        const mime = ImageCompressor.pickMime(opts.mimePreference, (m) => canvas.toDataURL(m, 0.5).startsWith(`data:${m}`));

        const ladder = ImageCompressor.qualityLadder(opts.maxQuality, opts.minQuality, opts.qualityStep);
        const cache = new Map<number, string>();
        const encode = (q: number) => {
            if (!cache.has(q)) cache.set(q, canvas.toDataURL(mime, q));
            return cache.get(q)!;
        };
        const { quality, bytes } = ImageCompressor.selectQuality(ladder, (q) => ImageCompressor.dataUrlBytes(encode(q)), {
            targetBytes: opts.targetBytes,
            minGainRatio: opts.minGainRatio,
        });
        const dataUrl = encode(quality);

        const result: ImageCompressorResult = { dataUrl, mime, quality, width, height, bytes };
        if (opts.outputBlob) {
            result.blob = await new Promise<Blob>((resolve, reject) =>
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('ImageCompressor: encode to blob failed'))), mime, quality)
            );
        }
        return result;
    }

    private async _decode(input: File | Blob | string): Promise<HTMLImageElement> {
        const src = typeof input === 'string' ? input : URL.createObjectURL(input);
        try {
            return await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('ImageCompressor: image decode failed'));
                el.src = src;
            });
        } finally {
            if (typeof input !== 'string') URL.revokeObjectURL(src);
        }
    }
}

export class ImageCompressorOptions {
    /** Longest edge after downscale (never upscales). */
    public maxEdge = 1800;
    /** Preferred output mimes, first supported wins (canvas support probed at runtime). */
    public mimePreference = ['image/webp', 'image/jpeg'];
    /** Optional hard byte budget for the encoded payload; ladder descends until it fits (or hits minQuality). */
    public targetBytes?: number;
    public maxQuality = 0.85;
    public minQuality = 0.5;
    public qualityStep = 0.07;
    /** Without targetBytes: stop stepping down when a step saves less than this ratio of the previous size. */
    public minGainRatio = 0.15;
    /** Also emit a Blob (result.blob). */
    public outputBlob = false;
}

export interface ImageCompressorResult {
    dataUrl: string;
    blob?: Blob;
    mime: string;
    quality: number;
    width: number;
    height: number;
    bytes: number;
}
