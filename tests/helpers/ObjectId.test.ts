import { ObjectId } from '../../src/helpers/ObjectId';

test('objectid-simple', () => {
    const param = ObjectId.new();
    expect(typeof param).toEqual('string');
    expect(param.length).toEqual(24);
});
test('objectid-new-and-parse', () => {
    const timestamp = 1638829992000;
    const param = ObjectId.new(timestamp);
    expect(typeof param).toEqual('string');
    expect(param.length).toEqual(24);
    const output = ObjectId.toDate(param);
    expect(output.getTime()).toEqual(timestamp);
    expect(output).toEqual(new Date('2021-12-06T22:33:12.000Z'));
});
test('objectid-with-trailing-zeros', () => {
    const param = ObjectId.new(new Date('2022-02-05T22:00:00.000Z').getTime());
    expect(param).toEqual('61fef3600000000000000000');
});
test('objectid-with-randomized-trail', () => {
    const param = ObjectId.new(new Date('2022-02-05T22:00:00.000Z').getTime(), true);
    expect(param.startsWith('61fef36')).toEqual(true);
    expect(param).not.toEqual('61fef3600000000000000000');
});
