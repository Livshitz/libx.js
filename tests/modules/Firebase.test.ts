// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { Firebase } from '../../src/modules/firebase/FirebaseModule';

const firebaseMock = {
    database: () => {},
};
const firebaseProviderMock = {};
let mod = new Firebase(firebaseMock, firebaseProviderMock);

beforeEach(() => {});

test('temp-positive', () => {
    // let param = { a: 1 };
    // let output = mod.dictToArray(param);
    // expect(output).toEqual([{ id: 'a', val: 1 }]);
    expect(true).toBeTruthy();
});
