export class Hash {
    public static sha256(msg: string): string {
        return SHA256.hash(msg);
    }

    public static sha1(msg: string): string {
        return SHA1.hash(msg);
    }

    // public static md5(msg: string): string {
    //     return MD5.hash(msg);
    // }
}

class SHA256 {
    static hash(msg: string): string {
        function ROTR(n: number, x: number): number {
            return (x >>> n) | (x << (32 - n));
        }

        function Σ0(x: number): number {
            return ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x);
        }

        function Σ1(x: number): number {
            return ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x);
        }

        function σ0(x: number): number {
            return ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3);
        }

        function σ1(x: number): number {
            return ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10);
        }

        function Ch(x: number, y: number, z: number): number {
            return (x & y) ^ (~x & z);
        }

        function Maj(x: number, y: number, z: number): number {
            return (x & y) ^ (x & z) ^ (y & z);
        }

        const K: number[] = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
            0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
            0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
            0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
            0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
            0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
            0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
            0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
            0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        function toWordArray(str: string): number[] {
            const l: number = str.length;
            const wl: number[] = [];
            for (let i = 0; i < l; i += 4) {
                wl.push(str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3));
            }
            return wl;
        }

        function toHexString(byteArray: number[]): string {
            return byteArray.map(function (byte) {
                return ('0' + ((byte >> 24) & 0xFF).toString(16)).slice(-2) +
                    ('0' + ((byte >> 16) & 0xFF).toString(16)).slice(-2) +
                    ('0' + ((byte >> 8) & 0xFF).toString(16)).slice(-2) +
                    ('0' + (byte & 0xFF).toString(16)).slice(-2);
            }).join('');
        }

        function processChunk(chunk: number[]): number[] {
            let w: number[] = [];
            let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;
            let T1: number, T2: number;
            a = H[0];
            b = H[1];
            c = H[2];
            d = H[3];
            e = H[4];
            f = H[5];
            g = H[6];
            h = H[7];

            for (let i = 0; i < 64; i++) {
                if (i < 16) w[i] = chunk[i] | 0;
                else w[i] = σ1(w[i - 2]) + w[i - 7] + σ0(w[i - 15]) + w[i - 16];

                T1 = h + Σ1(e) + Ch(e, f, g) + K[i] + w[i];
                T2 = Σ0(a) + Maj(a, b, c);
                h = g;
                g = f;
                f = e;
                e = (d + T1) | 0;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) | 0;
            }

            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
            return H;
        }

        let H: number[] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

        msg += String.fromCharCode(0x80); // Add the trailing '1' bit to the message
        let l: number = msg.length / 4 + 2; // Length of message in 32-bit words, including padding
        let N: number = Math.ceil(l / 16); // Number of 512-bit chunks
        let M: number[][] = new Array(N);

        for (let i = 0; i < N; i++) {
            M[i] = new Array(16);
            for (let j = 0; j < 16; j++) {
                M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                    (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
            }
        }

        M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

        for (let i = 0; i < N; i++) {
            processChunk(M[i]);
        }

        return toHexString(H);
    }
}

class SHA1 {
    static hash(msg: string): string {
        function leftRotate(n: number, x: number): number {
            return (x << n) | (x >>> (32 - n));
        }

        let H0: number = 0x67452301;
        let H1: number = 0xEFCDAB89;
        let H2: number = 0x98BADCFE;
        let H3: number = 0x10325476;
        let H4: number = 0xC3D2E1F0;

        // Pre-processing
        msg += String.fromCharCode(0x80); // Append '1' bit to message
        let l: number = msg.length / 4 + 2; // Length of message in 32-bit words, including padding
        let N: number = Math.ceil(l / 16); // Number of 512-bit blocks
        let M: number[][] = new Array(N);

        for (let i = 0; i < N; i++) {
            M[i] = new Array(16);
            for (let j = 0; j < 16; j++) {
                M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                    (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
            }
        }

        M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

        // Hash computation
        for (let i = 0; i < N; i++) {
            let W: number[] = new Array(80);

            // Message schedule
            for (let t = 0; t < 16; t++) {
                W[t] = M[i][t];
            }
            for (let t = 16; t < 80; t++) {
                W[t] = leftRotate(1, W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]);
            }

            // Initialize hash value for this block
            let A: number = H0;
            let B: number = H1;
            let C: number = H2;
            let D: number = H3;
            let E: number = H4;

            // Main loop
            for (let t = 0; t < 80; t++) {
                let temp: number = leftRotate(5, A) + SHA1.f(t, B, C, D) + E + W[t] + SHA1.K(t);
                E = D;
                D = C;
                C = leftRotate(30, B);
                B = A;
                A = temp;
            }

            // Add this block's hash to result so far
            H0 = (H0 + A) | 0;
            H1 = (H1 + B) | 0;
            H2 = (H2 + C) | 0;
            H3 = (H3 + D) | 0;
            H4 = (H4 + E) | 0;
        }

        return SHA1.toHexStr(H0) + SHA1.toHexStr(H1) + SHA1.toHexStr(H2) + SHA1.toHexStr(H3) + SHA1.toHexStr(H4);
    }

    private static f(t: number, B: number, C: number, D: number): number {
        if (t < 20) return (B & C) | ((~B) & D);
        if (t < 40) return B ^ C ^ D;
        if (t < 60) return (B & C) | (B & D) | (C & D);
        return B ^ C ^ D;
    }

    private static K(t: number): number {
        if (t < 20) return 0x5A827999;
        if (t < 40) return 0x6ED9EBA1;
        if (t < 60) return 0x8F1BBCDC;
        return 0xCA62C1D6;
    }

    private static toHexStr(n: number): string {
        let s: string = "", v: number;
        for (let i = 7; i >= 0; i--) {
            v = (n >>> (i * 4)) & 0xf;
            s += v.toString(16);
        }
        return s;
    }
}

class MD5 {
    static hash(msg: string): string {
        function leftRotate(value: number, shift: number): number {
            return (value << shift) | (value >>> (32 - shift));
        }

        let K = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];

        let s = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        let a0 = 0x67452301;
        let b0 = 0xefcdab89;
        let c0 = 0x98badcfe;
        let d0 = 0x10325476;

        // Pre-processing: adding a single 1 bit
        msg += String.fromCharCode(0x80);

        // Pre-processing: padding with zeros
        while ((msg.length / 4 + 2) % 16 !== 0) {
            msg += String.fromCharCode(0);
        }

        // Pre-processing: append original length in bits mod 2^64 to message
        let msgLen = msg.length * 8;
        msg += String.fromCharCode(msgLen & 0xff, (msgLen >>> 8) & 0xff, (msgLen >>> 16) & 0xff, (msgLen >>> 24) & 0xff);
        msg += String.fromCharCode(0, 0, 0, 0); // Append 4 more zero bytes

        // Process the message in successive 512-bit chunks
        for (let i = 0; i < msg.length; i += 64) {
            let chunk = msg.slice(i, i + 64);

            let M = new Array(16);
            for (let j = 0; j < 16; j++) {
                M[j] = chunk.charCodeAt(j * 4) + (chunk.charCodeAt(j * 4 + 1) << 8) +
                    (chunk.charCodeAt(j * 4 + 2) << 16) + (chunk.charCodeAt(j * 4 + 3) << 24);
            }

            let A = a0;
            let B = b0;
            let C = c0;
            let D = d0;

            for (let j = 0; j < 64; j++) {
                let F, g;
                if (j < 16) {
                    F = (B & C) | ((~B) & D);
                    g = j;
                } else if (j < 32) {
                    F = (D & B) | ((~D) & C);
                    g = (5 * j + 1) % 16;
                } else if (j < 48) {
                    F = B ^ C ^ D;
                    g = (3 * j + 5) % 16;
                } else {
                    F = C ^ (B | (~D));
                    g = (7 * j) % 16;
                }

                let temp = D;
                D = C;
                C = B;
                B = B + leftRotate((A + F + K[j] + M[g]), s[j]);
                A = temp;
            }

            a0 = (a0 + A) | 0;
            b0 = (b0 + B) | 0;
            c0 = (c0 + C) | 0;
            d0 = (d0 + D) | 0;
        }

        function toHexStr(val: number): string {
            let str = '';
            for (let i = 0; i < 4; i++) {
                str += ('0' + ((val >> (i * 8)) & 0xff).toString(16)).slice(-2);
            }
            return str;
        }

        return toHexStr(a0) + toHexStr(b0) + toHexStr(c0) + toHexStr(d0);
    }
}
