// helpers.getMeasure-positive
// import iMyModule from '../interfaces/IMyModule';
import { Firebase } from '../../src/modules/Firebase';

const firebaseMock = {
    database: () => {},
};
const firebaseProviderMock = {};
let mod = new Firebase(firebaseMock, firebaseProviderMock);

beforeEach(() => {});

test('helpers.dictToArray-positive', () => {
    let param = { a: 1 };
    let output = mod.dictToArray(param);
    expect(output).toEqual([{ id: 'a', val: 1 }]);
});

test('helpers.dictToArray-realistic-positive', () => {
    let param = { myKey: { someValue: 'val' } };
    let output = mod.dictToArray(param);
    expect(output).toEqual([{ id: 'myKey', someValue: 'val' }]);
});

test('helpers.arrayToDic-positive', () => {
    let param = [1, 2, 'hello'];
    let output = mod.arrayToDic(param);
    expect(output).toEqual({ 1: true, 2: true, hello: true });
});
