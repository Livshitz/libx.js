import { expect, test, beforeAll, beforeEach, describe, vi } from 'vitest';
// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { Firebase } from '../../src/modules/firebase/FirebaseModule';

// Mock Firebase modules
vi.mock('firebase/database', () => ({
    getDatabase: vi.fn(() => ({
        app: {
            name: '[DEFAULT]',
            options: {
                databaseURL: 'https://test.firebaseio.com',
            },
        },
    })),
    ref: vi.fn(() => ({
        toString: () => 'https://test.firebaseio.com/test',
    })),
    get: vi.fn(() =>
        Promise.resolve({
            val: () => null,
            exists: () => false,
        })
    ),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
    onValue: vi.fn((ref, callback) => {
        // Immediately call callback with mock data
        callback({ val: () => null });
        return () => { }; // Return unsubscribe function
    }),
    off: vi.fn(),
    push: vi.fn(),
    query: vi.fn(),
    orderByChild: vi.fn(),
    orderByKey: vi.fn(),
    equalTo: vi.fn(),
    startAt: vi.fn(),
    limitToFirst: vi.fn(),
    onDisconnect: vi.fn(() => ({
        remove: vi.fn(() => Promise.resolve()),
        set: vi.fn(() => Promise.resolve()),
    })),
    increment: vi.fn((n) => n),
    onChildChanged: vi.fn((ref, callback) => () => { }),
}));

vi.mock('firebase/storage', () => ({
    getStorage: vi.fn(() => ({
        app: {
            name: '[DEFAULT]',
            options: {
                storageBucket: 'test-bucket',
            },
        },
    })),
    ref: vi.fn((storage, path) => ({
        toString: () => `gs://test-bucket/${path}`,
        fullPath: path,
    })),
    uploadBytes: vi.fn(() => Promise.resolve({ metadata: { fullPath: 'test/path' } })),
    getDownloadURL: vi.fn(() => Promise.resolve('https://storage.googleapis.com/test-bucket/test/path')),
    deleteObject: vi.fn(() => Promise.resolve()),
}));

// Mock Firebase App for testing
const firebaseAppMock = {
    name: '[DEFAULT]',
    options: {
        databaseURL: 'https://test.firebaseio.com',
    },
} as any;

const firebaseConfigMock = {};
let mod: Firebase;

beforeEach(() => {
    mod = new Firebase(firebaseAppMock, firebaseConfigMock);
});

test('temp-positive', () => {
    // let param = { a: 1 };
    // let output = mod.dictToArray(param);
    // expect(output).toEqual([{ id: 'a', val: 1 }]);
    expect(true).toBeTruthy();
});

test('Firebase instance should be created', () => {
    expect(mod).toBeDefined();
    expect(mod.firebaseApp).toBe(firebaseAppMock);
});

describe('Storage operations', () => {
    test('uploadFile should upload a file', async () => {
        const mockBlob = new Blob(['test data'], { type: 'text/plain' });
        const path = 'test/file.txt';

        const result = await mod.uploadFile(path, mockBlob);

        expect(result).toBe(path);
    });

    test('getFileUrl should return download URL', async () => {
        const path = 'test/file.txt';

        const url = await mod.getFileUrl(path);

        expect(url).toBe('https://storage.googleapis.com/test-bucket/test/path');
    });

    test('deleteFile should delete a file', async () => {
        const path = 'test/file.txt';

        await expect(mod.deleteFile(path)).resolves.toBeUndefined();
    });

    test('uploadAndGetUrl should upload and return URL', async () => {
        const mockBlob = new Blob(['test data'], { type: 'text/plain' });
        const path = 'test/file.txt';

        const url = await mod.uploadAndGetUrl(path, mockBlob);

        expect(url).toBe('https://storage.googleapis.com/test-bucket/test/path');
    });

    test('getStorageRef should return a storage reference', () => {
        const path = 'test/file.txt';

        const ref = mod.getStorageRef(path);

        expect(ref).toBeDefined();
        expect(ref.fullPath).toBe(path);
    });
});
