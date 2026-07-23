import { expect, test, describe } from 'vitest';
import { ImageCompressor } from '../../src/browser/ImageCompressor';

describe('fitToMaxEdge', () => {
    test('downscales landscape to max edge', () => {
        expect(ImageCompressor.fitToMaxEdge(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500, scale: 0.5 });
    });
    test('downscales portrait by the longest edge', () => {
        expect(ImageCompressor.fitToMaxEdge(1000, 4000, 2000).height).toEqual(2000);
    });
    test('never upscales', () => {
        expect(ImageCompressor.fitToMaxEdge(800, 600, 2000)).toEqual({ width: 800, height: 600, scale: 1 });
    });
});

describe('qualityLadder', () => {
    test('descends from max to min inclusive', () => {
        const ladder = ImageCompressor.qualityLadder(0.85, 0.5, 0.07);
        expect(ladder[0]).toEqual(0.85);
        expect(ladder[ladder.length - 1]).toEqual(0.5);
        for (let i = 1; i < ladder.length; i++) expect(ladder[i]).toBeLessThan(ladder[i - 1]);
    });
    test('single step when max == min', () => {
        expect(ImageCompressor.qualityLadder(0.7, 0.7, 0.07)).toEqual([0.7]);
    });
});

describe('dataUrlBytes', () => {
    test('measures decoded payload size incl. padding', () => {
        // 'hi!' → 3 bytes → base64 'aGkh' (no padding)
        expect(ImageCompressor.dataUrlBytes('data:image/png;base64,aGkh')).toEqual(3);
        // 'hi' → 2 bytes → 'aGk='
        expect(ImageCompressor.dataUrlBytes('data:image/png;base64,aGk=')).toEqual(2);
    });
});

describe('pickMime', () => {
    test('first supported preference wins', () => {
        expect(ImageCompressor.pickMime(['image/webp', 'image/jpeg'], (m) => m === 'image/jpeg')).toEqual('image/jpeg');
    });
    test('falls back to jpeg when nothing supported', () => {
        expect(ImageCompressor.pickMime(['image/webp'], () => false)).toEqual('image/jpeg');
    });
});

describe('selectQuality', () => {
    const sizes: Record<number, number> = { 0.85: 1000, 0.78: 700, 0.71: 600, 0.64: 560, 0.5: 540 };
    const bytesAt = (q: number) => sizes[q] ?? 500;

    test('diminishing returns: stops when a step saves < minGainRatio', () => {
        // 1000→700 saves 30% (keep), 700→600 saves 14% (<15% → stop at 0.78)
        const r = ImageCompressor.selectQuality([0.85, 0.78, 0.71, 0.64, 0.5], bytesAt, { minGainRatio: 0.15 });
        expect(r).toEqual({ quality: 0.78, bytes: 700 });
    });

    test('targetBytes: highest quality that fits the budget', () => {
        const r = ImageCompressor.selectQuality([0.85, 0.78, 0.71], bytesAt, { targetBytes: 650, minGainRatio: 0.15 });
        expect(r).toEqual({ quality: 0.71, bytes: 600 });
    });

    test('targetBytes unreachable: returns the floor result', () => {
        const r = ImageCompressor.selectQuality([0.85, 0.78], bytesAt, { targetBytes: 10, minGainRatio: 0.15 });
        expect(r).toEqual({ quality: 0.78, bytes: 700 });
    });

    test('single-entry ladder returns it', () => {
        const r = ImageCompressor.selectQuality([0.85], bytesAt, { minGainRatio: 0.15 });
        expect(r).toEqual({ quality: 0.85, bytes: 1000 });
    });
});
