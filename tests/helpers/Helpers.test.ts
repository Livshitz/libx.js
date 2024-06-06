import { NumberExtensions } from '../../src/extensions/NumberExtensions';
import { helpers, SemverPart } from '../../src/helpers';
import fs from 'fs';

var dataset: any = {};

beforeAll(() => { });

// [[[[[[[[[[  Helper Extensions  ]]]]]]]]]]
// TODO: isWindow, arrayBufferToBuffer, bufferToArrayBuffer, getProjectConfig, DependencyInjector, jsonRecurse, jsonResolveReferences

test('helpers.newGuid-positive', () => {
    let guid = helpers.newGuid(true);
    expect(guid.replace(/[\d\w]/g, '')).toEqual('----');
});

test('helpers.newPromise-positive', () => {
    let p = helpers.newPromise();
    p.resolve(true);
    expect(p).resolves.toEqual(true);
});

// test('helpers.parseJsonFileStripComments-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.parseJsonFileStripComments(param);
// 	expect(output).toEqual(true);
// });

// test('helpers.parseConfig-positive', () => {
// 	let param = { a : 1};
// 	let output = helpers.parseConfig(param);
// 	expect(output).toEqual(true);
// });

test('helpers.hexc-positive', () => {
    let param = 'rgb(10,11,12)';
    let output = helpers.hexc(param);
    expect(output).toEqual('#0a0b0c');
});

test('helpers.jsonify-compact-positive', () => {
    let param = { a: 1, b: { c: 3 } };
    let output = helpers.jsonify(param, true);
    expect(output).toEqual('{"a":1,"b":{"c":3}}');
});
test('helpers.jsonify-notcompact-positive', () => {
    let param = { a: 1, b: { c: 3 } };
    let output = helpers.jsonify(param);
    // expect(output.replace(/[\t\s]/g, '')).toEqual('{"a":1,"b":{"c":3}}');
    expect(output).toEqual('{\n  "a": 1,\n  "b": {\n    "c": 3\n  }\n}');
});

test('helpers.parse-positive', () => {
    let param = '{\n  "a": 1,\n  "b": {\n    "c": 3\n  }\n}';
    let output = helpers.parse(param);
    expect(output).toEqual({ a: 1, b: { c: 3 } });
});

test('helpers.stringifyOnce-positive', () => {
    let param = { a: 1, b: 2, c: { ca: 11 } };
    let output = helpers.stringifyOnce(param, (k, v) => (k == 'b' ? v * 20 : v), 0);
    expect(output).toEqual('{"a":1,"b":40,"c":{"ca":11}}');
});

test('helpers.getMatch-positive', () => {
    let output = helpers.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/);
    expect(output[0]).toEqual('BB');
});
test('helpers.getMatch-positive-2', () => {
    let output = helpers.getMatch('aaBB33', /\w+?([A-Z]+?)(\d+)/, 2);
    expect(output[0]).toEqual('33');
});

test('helpers.getMatches-positive', () => {
    let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/);
    expect(output[0][1]).toEqual('BB');
    expect(output[0][2]).toEqual('33');
    expect(output[0].groups.test).toEqual('BB');
});
test('helpers.getMatches-positive-index', () => {
    let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 2);
    expect(output[0]).toEqual('33');
});
test('helpers.getMatches-positive-groupName', () => {
    let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, 'test');
    expect(output[0]).toEqual('BB');
});
test('helpers.getMatches-positive-groups', () => {
    let output = helpers.getMatches('aaBB33', /\w+?(?<test>[A-Z]+?)(\d+)/, true);
    expect(output[0].test).toEqual('BB');
});

test('helpers.base64ToUint8Array-positive', () => {
    let param = 'YWJj';
    let output = helpers.base64ToUint8Array(param);
    expect(output.toString()).toEqual('97,98,99');
});

test('helpers.getParamNames-positive-arrow', () => {
    let param = (a) => { };
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-function', () => {
    let param = function (a) { };
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-async', () => {
    let param = async (a) => { };
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
    let param = async (a) => { };
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});
test('helpers.getParamNames-positive-asyncWithSpace', () => {
    let namedFunc = async (a) => { };
    let param = namedFunc;
    let output = helpers.getParamNames(param);
    expect(output).toEqual(['a']);
});

test('helpers.randomNumber-positive', () => {
    let output = helpers.randomNumber(100, 50);
    expect(output).not.toBeNaN();
    expect(output).toBeLessThanOrEqual(100);
    expect(output).toBeGreaterThanOrEqual(50);
});

test('helpers.shuffle-positive', () => {
    let param = [1, 2, 3, 4, 5];
    let output = helpers.shuffle(param);
    expect(output.length).toEqual(5);
    expect(output).not.toEqual(param);
});

test('helpers.measure-positive', async () => {
    const dur = helpers.Measurement.start();
    await helpers.delay(100);
    let output = dur.peek()
    await helpers.delay(100);
    expect(output).toBeLessThanOrEqual(200);
    output = dur.stop();
    expect(output).toBeLessThanOrEqual(400);
});

test('helpers.getMeasure-positive', async () => {
    const dur = helpers.Measurement.start();
    await helpers.delay(100);
    let output = dur.stop();
    expect(output).toBeLessThanOrEqual(140);
});

test('helpers.bufferToArrayBuffer-positive', async () => {
    let param = Buffer.from('abc');
    let output = helpers.bufferToArrayBuffer(param);
    expect(output.byteLength).toEqual(3);
});
test('helpers.arrayBufferToBuffer-positive', async () => {
    let param = helpers.bufferToArrayBuffer(Buffer.from('abc'));
    let output = helpers.arrayBufferToBuffer(param);
    expect(output.toString()).toEqual('abc');
});

test('helpers.parseJsonFileStripComments-positive', async () => {
    let param = `{ 
		"a": 111,
		"b": 222
		// "c": 333,
	}`;
    let output = helpers.parseJsonFileStripComments(param);
    expect(output).toEqual({ a: 111, b: 222 });
});

test('helpers.parseConfig-positive', async () => {
    let param = `{  
		"myEnvVars": {
			"ShareVar": 123,
			"replaceAble": "--{{myPrivateVar}}--"
		},
		"private": {
			"myPrivateVar": 999
		},
		
		"envs": {
			"dev": {
				"isDebug": true,
				"myEnvVars": {
					"perEnvVar": "dev"
				}
			},
			"prod": {
				"isDebug": false,
				"myEnvVars": {
					"perEnvVar": "prod"
				}
			}
		}
	}`;
    let output = helpers.parseConfig(param, 'dev');
    expect(output).toEqual({
        myEnvVars: {
            ShareVar: 123,
            perEnvVar: 'dev',
            replaceAble: '--999--',
        },
        isDebug: true,
        private: {
            myPrivateVar: 999,
        },
    });
});

test('helpers.getObjectByPath-positive', () => {
    let param = { a: { b: 1 } };
    let output = helpers.getObjectByPath('a.b', param);
    expect(output).toEqual(1);
});

test('helpers.keys-positive', () => {
    let param = { a: 1 };
    let output = helpers.keys(param);
    expect(output).toEqual(['a']);
});

test('helpers.values-positive', () => {
    let param = { a: 1 };
    let output = helpers.values(param);
    expect(output).toEqual([1]);
});

enum myEnum {
    A = 1,
    B = 2,
}

test('helpers.enumToArray-positive', () => {
    let output = helpers.enumToArray(myEnum);
    expect(output).toEqual(['A', 'B']);
});

test('helpers.getEnumKeyFromValue-positive', () => {
    let output = helpers.getEnumKeyFromValue(myEnum, 2);
    expect(output).toEqual('B');
});

test('helpers.formatify', () => {
    let output = helpers.formatify(
        {
            myField: '{{toBeReplaced}}',
            myField2: 'notToBeReplaced',
        },
        {
            toBeReplaced: 111,
            notToBeReplaced: 222,
        }
    );
    expect(output).toEqual({
        myField: '111',
        myField2: 'notToBeReplaced',
    });
});

test('helpers.formatify - multi level vars', () => {
    let output = helpers.formatify('aa {{x.toBeReplaced}} bb {{toBeReplaced}} - {notToBeReplaced}', {
        toBeReplaced: 111,
        x: {
            toBeReplaced: 222,
        },
        notToBeReplaced: 333,
    });
    expect(output).toEqual('aa 222 bb 111 - {notToBeReplaced}');
});

test('helpers.formatify - keep missing vars', () => {
    let output = helpers.formatify('aa {{x.toBeReplaced}} bb {{toBeReplaced}} - {notToBeReplaced}', {
        toBeReplaced: 111,
    });
    expect(output).toEqual('aa {{x.toBeReplaced}} bb 111 - {notToBeReplaced}');
});

test('helpers.formatify - remove missing vars', () => {
    let output = helpers.formatify(
        'aa {{x.toBeReplaced}} bb {{toBeReplaced}} - {notToBeReplaced}',
        {
            toBeReplaced: 111,
        },
        true
    );
    expect(output).toEqual('aa  bb 111 - {notToBeReplaced}');
});

test('helpers.formatify - multiline in string', () => {
    let output = helpers.formatify(
        'aa {{input}}',
        {
            input: `- name: How They Bypassed Multi-Factor Authentication in Seconds
            text: |-
              Alright, so Mike's `,
        },
        true
    );
    expect(output).toEqual(`aa - name: How They Bypassed Multi-Factor Authentication in Seconds\n            text: |-\n              Alright, so Mike's `);
});

test('helpers.stringToColour-negative', () => {
    let output = helpers.stringToColour('blabla!@#');
    expect(output).toEqual('#2453c7');
    output = helpers.stringToColour('blabla!@');
    expect(output).toEqual('#dfc871');
});

test('helpers.for-positive', () => {
    let output = 0;
    helpers.for((i) => output++, 10, 5, 2);
    expect(output).toEqual(3);
});
test('helpers.for-returnValue', () => {
    let v = 0;
    const output = helpers.for((i) => v++, 10, 5, 2);
    expect(output).toEqual([0, 1, 2]);
});

test('helpers.each-positive', () => {
    let arr = [1, 2, 3, 4, 5];
    let output = 0;
    helpers.each(arr, (x) => (output += x));
    expect(output).toEqual(15);
});

test('helpers.setToArr-positive', () => {
    let obj = {
        a1: { b: 1 },
        a2: { b: 2 },
        a3: { b: 3 },
    }
    let output = helpers.setToArr(obj);
    expect(output).toEqual([
        [{ b: 1 }, 'a1', 0],
        [{ b: 2 }, 'a2', 1],
        [{ b: 3 }, 'a3', 2],
    ]);
});

test('helpers.eachPair-positive', () => {
    let obj = {
        a1: { b: 1 },
        a2: { b: 2 },
        a3: { b: 3 },
    }
    let output = 0;
    helpers.eachPair(obj, (x, k) => (output += x.b));
    expect(output).toEqual(6);
});

test('helpers.csvToJson-positive', () => {
    let input = `id,name,author
                1,To Kill an Mockingbird,1
                2,Lord of the Rings,2
                3,Hamlet,3`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        { id: '1', name: 'To Kill an Mockingbird', author: '1' },
        { id: '2', name: 'Lord of the Rings', author: '2' },
        { id: '3', name: 'Hamlet', author: '3' },
    ]);
});

test('helpers.csvToJson-positive', () => {
    let input = `"Survived",Pclass,Name,Sex,Age,Siblings/Spouses Aboard,Parents/Children Aboard,Fare
    "0",3,Mr. Owen Harris Braund,male,22,1,0,7.25
    "1",1,Mrs. John Bradley (Florence Briggs Thayer) Cumings,female,38,1,0,71.2833`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            Survived: '0',
            Pclass: '3',
            Name: 'Mr. Owen Harris Braund',
            Sex: 'male',
            Age: '22',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '7.25',
        },
        {
            Survived: '1',
            Pclass: '1',
            Name: 'Mrs. John Bradley (Florence Briggs Thayer) Cumings',
            Sex: 'female',
            Age: '38',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '71.2833',
        },
    ]);
});

test('helpers.csvToJson-double quote', () => {
    let input = `"Survived",Pclass,Name,Sex,Age,Siblings/Spouses Aboard,Parents/Children Aboard,Fare
    "0",3,""Mr. Owen Harris Braund"",male,22,1,0,7.25
    "1",1,Mrs. John Bradley (Florence Briggs Thayer) Cumings,female,38,1,0,71.2833`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            Survived: '0',
            Pclass: '3',
            Name: '"Mr. Owen Harris Braund"',
            Sex: 'male',
            Age: '22',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '7.25',
        },
        {
            Survived: '1',
            Pclass: '1',
            Name: 'Mrs. John Bradley (Florence Briggs Thayer) Cumings',
            Sex: 'female',
            Age: '38',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '71.2833',
        },
    ]);
});

test('helpers.csvToJson-sheet', () => {
    let input = `"""Survived""",Pclass,Name
"""0""",3,"""Mr. Owen Harris
 Braund"""
1,1,Mrs. John Bradley (Florence Briggs Thayer) Cumings`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            Survived: '"0"',
            Pclass: '3',
            Name: '"Mr. Owen Harris\n Braund"',
        },
        {
            Survived: '1',
            Pclass: '1',
            Name: 'Mrs. John Bradley (Florence Briggs Thayer) Cumings',
        },
    ]);
});

test('helpers.csvToJson-multilineline', () => {
    let input = `"Survived",Pclass,Name,Sex,Age,Siblings/Spouses Aboard,Parents/Children Aboard,Fare
    "0",3,""Mr. Owen Harris\n Braund"",male,22,1,0,7.25
    "1",1,Mrs. John Bradley (Florence Briggs Thayer) Cumings,female,38,1,0,71.2833`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            Survived: '0',
            Pclass: '3',
            Name: '"Mr. Owen Harris\n Braund"',
            Sex: 'male',
            Age: '22',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '7.25',
        },
        {
            Survived: '1',
            Pclass: '1',
            Name: 'Mrs. John Bradley (Florence Briggs Thayer) Cumings',
            Sex: 'female',
            Age: '38',
            'Siblings/Spouses Aboard': '1',
            'Parents/Children Aboard': '0',
            Fare: '71.2833',
        },
    ]);
});

test('helpers.csvToJson-file-1', () => {
    const input = fs.readFileSync(__dirname + '/../fakes/test-1.csv').toString();
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            'Test Case:': '1',
            'Inputs:': '{\n"input": "VP R&Ds in US-based companies with 20-100 employees"\n}',
            'Expectation:':
                'Expecting this exact YAML result:\ncountry: United States\nrole:\n  - VP R&D\nemployee_count:\n  min: 20\n  max: 100',
        },
        {
            'Test Case:': '2',
            'Inputs:': '{\n  "input": "VP R&Ds in US-based companies"\n}',
            'Expectation:': 'Expecting this exact YAML result:\ncountry: United States\nrole:\n  - VP R&D',
        },
        {
            'Test Case:': '3',
            'Inputs:': '{\n  "input": "Lawyer in US"\n}',
            'Expectation:': 'Expecting this exact YAML result:\ncountry: United States\nrole:\n  - Lawyer',
        },
        {
            'Test Case:': '4',
            'Inputs:': '{\n  "input": "VP R&Ds and team leads in US-based companies"\n}',
            'Expectation:': 'Expecting this exact YAML result:\ncountry: United States\nrole:\n  - VP R&D\n  - Team Lead',
        },
    ]);
});

test('helpers.csvToJson-multiline-2', () => {
    let input = `"testCase","variables","expectation"
"full case","input: ""VP R&Ds in US-based companies with 100+ employees""","Expecting this exact YAML result:
country: United States
role:
    - VP R&D
employee_count:
    min: 100"`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            testCase: 'full case',
            variables: 'input: "VP R&Ds in US-based companies with 100+ employees"',
            expectation: 'Expecting this exact YAML result:\ncountry: United States\nrole:\n    - VP R&D\nemployee_count:\n    min: 100',
        },
    ]);
});

test('helpers.csvToJson-simple', () => {
    let input = `"price","houseType","arnona"
    "₪500","",""`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            houseType: '',
            price: '₪500',
            arnona: '',
        }
    ]);
});

test('helpers.csvToJson-simple-complex', () => {
    let input = `"price","houseType","area"
    "₪500","חניה","תל אביב"
    "₪3,500","דירה","תל אביב"
    "₪2,500","מחסן","תל אביב"`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            area: 'תל אביב',
            houseType: 'חניה',
            price: '₪500',
        },
        {
            area: 'תל אביב',
            houseType: 'דירה',
            price: '₪3,500',
        },
        {
            area: 'תל אביב',
            houseType: 'מחסן',
            price: '₪2,500',
        },
    ]);
});

test('helpers.csvToJson-complex', () => {
    let input = `"price","houseType","area","city","neighborhood","address","rooms","size","floor","totalFloors","creationDate","columns","furnished","aircondition","parking","secure space","porch","accessibility","bars","elevator","storage","sun terrace","renovated","porches","arnona","vaad","gardenSize"
    "₪500","חניה","תל אביב","תל אביב יפו","שיכון בבלי","חנה זמר 3","","10","0","0","04/02/2021","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","","","",""
    "₪3,500","דירה","תל אביב","תל אביב יפו","התקווה","יחיעם 47","2","29","1","1","","","","","","","","","","","","","","1","100","",""
    "₪2,500","מחסן","תל אביב","תל אביב יפו","נוה שאנן","צ'לנוב 52","","35","0","0","22/08/2021","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","FALSE","","","",""`;
    const output = helpers.csvToJson(input);
    expect(output).toMatchObject([
        {
            accessibility: 'FALSE',
            address: 'חנה זמר 3',
            aircondition: 'FALSE',
            area: 'תל אביב',
            arnona: '',
            bars: 'FALSE',
            city: 'תל אביב יפו',
            columns: 'FALSE',
            creationDate: '04/02/2021',
            elevator: 'FALSE',
            floor: '0',
            furnished: 'FALSE',
            gardenSize: '',
            houseType: 'חניה',
            neighborhood: 'שיכון בבלי',
            parking: 'FALSE',
            porch: 'FALSE',
            porches: '',
            price: '₪500',
            renovated: 'FALSE',
            rooms: '',
            'secure space': 'FALSE',
            size: '10',
            storage: 'FALSE',
            'sun terrace': 'FALSE',
            totalFloors: '0',
            vaad: '',
        },
        {
            accessibility: '',
            address: 'יחיעם 47',
            aircondition: '',
            area: 'תל אביב',
            arnona: '100',
            bars: '',
            city: 'תל אביב יפו',
            columns: '',
            creationDate: '',
            elevator: '',
            floor: '1',
            furnished: '',
            gardenSize: '',
            houseType: 'דירה',
            neighborhood: 'התקווה',
            parking: '',
            porch: '',
            porches: '1',
            price: '₪3,500',
            renovated: '',
            rooms: '2',
            'secure space': '',
            size: '29',
            storage: '',
            'sun terrace': '',
            totalFloors: '1',
            vaad: '',
        },
        {
            accessibility: 'FALSE',
            address: "צ'לנוב 52",
            aircondition: 'FALSE',
            area: 'תל אביב',
            arnona: '',
            bars: 'FALSE',
            city: 'תל אביב יפו',
            columns: 'FALSE',
            creationDate: '22/08/2021',
            elevator: 'FALSE',
            floor: '0',
            furnished: 'FALSE',
            gardenSize: '',
            houseType: 'מחסן',
            neighborhood: 'נוה שאנן',
            parking: 'FALSE',
            porch: 'FALSE',
            porches: '',
            price: '₪2,500',
            renovated: 'FALSE',
            rooms: '',
            'secure space': 'FALSE',
            size: '35',
            storage: 'FALSE',
            'sun terrace': 'FALSE',
            totalFloors: '0',
            vaad: '',
        },
    ]);
});

test('helpers.median-positive', () => {
    let input = [99, 20, 35, 40];
    let output = 37.5;
    expect(helpers.median(input)).toEqual(output);
    expect(input).toEqual([99, 20, 35, 40]);
});
test('helpers.average-positive', () => {
    let input = [99, 20, 35, 40];
    let output = 48.5;
    expect(helpers.average(input)).toEqual(output);
});
test('helpers.std-positive', () => {
    let input = [99, 20, 35, 40];
    let output = 34.72;
    let std = helpers.std(input);
    std = NumberExtensions.toFixedNum.call(std, 2);
    expect(std).toEqual(output);
});

test('date.humanizeTime-positive', () => {
    let output = helpers.humanizeTime(143295);
    expect(output).toBe('00:02:23');
});
test('date.humanizeTime-greater-than-day-positive', () => {
    let output = helpers.humanizeTime(86401000);
    expect(output).toBe('24:00:01');
});
test('date.humanizeTime-less-than-10-ms', () => {
    let output = helpers.humanizeTime(1);
    expect(output).toBe('00:00:00');
});

test('fixYaml-positive', () => {
    let output = helpers.fixYaml(
        `
a: "123"
b: "321"
c: "Hello "World"! "
`
    );
    expect(output).toBe(
        `
a: "123"
b: "321"
c: "Hello 'World'! "
`
    );
});

/*
describe('helpers.normalizeJson', ()=>{
    test.only('helpers.normalizeJson-simple', () => {
        const input = `{"credibility" : "B.Sc - Computer Science, "H.I.T" Holon, “Achid” ‘Aharai’ instructor"}`;
        const expected = `{"credibility":"B.Sc - Computer Science, “H.I.T“ Holon, “Achid” ‘Aharai’ instructor"}`;
        let output = helpers.normalizeJson(input);
        expect(output).toBe(expected);
    });
    test.only('helpers.normalizeJson-multiple keys', () => {
        const input = `{"credibility" : "B.Sc - Computer Science, "H.I.T" Holon, "Achid" ‘Aharai’ instructor", "key": "value a "b" c" }`;
        const expected = `{"credibility":"B.Sc - Computer Science, “H.I.T“ Holon, “Achid“ ‘Aharai’ instructor", "key":"value a “b“ c"}`;
        let output = helpers.normalizeJson(input);
        expect(output).toBe(expected);
    });
    test.only('helpers.normalizeJson-bad json', () => {
        const input = `{"credibility" : "B.Sc - Computer Science, "H.I.T" Holon, "Achid" ‘Aharai’ instructor", "key": "value a "b" c", }`;
        const expected = `{"credibility":"B.Sc - Computer Science, “H.I.T“ Holon, “Achid“ ‘Aharai’ instructor", "key":"value a “b“ c"}`;
        let output = helpers.normalizeJson(input);
        expect(output).toBe(expected);
    });
});
*/

describe('helpers.bumpVersion', () => {
    test('date.bumpVersion-simple-major-positive', () => {
        let output = helpers.bumpVersion('1.2.3', SemverPart.Major);
        expect(output).toBe('2.0.0');
    });
    test('date.bumpVersion-simple-minor-positive', () => {
        let output = helpers.bumpVersion('1.2.3', SemverPart.Minor);
        expect(output).toBe('1.3.0');
    });
    test('date.bumpVersion-simple-patch-positive', () => {
        let output = helpers.bumpVersion('1.2.3', SemverPart.Patch);
        expect(output).toBe('1.2.4');
    });
    test('date.bumpVersion-replace-minor-positive', () => {
        let output = helpers.bumpVersion('1.2.3', SemverPart.Minor, 10);
        expect(output).toBe('1.10.0');
    });
    test('date.bumpVersion-replace-positive', () => {
        let output = helpers.bumpVersion('1.2.3', 'replace', '4.4.4');
        expect(output).toBe('4.4.4');
    });
});

describe('helpers dictionary helpers', () => {
    test('helpers.dictToArray-positive', () => {
        let param = { a: 1 };
        let output = helpers.dictToArray(param);
        expect(output).toEqual([{ id: 'a', val: 1 }]);
    });

    test('helpers.dictToArray-realistic-positive', () => {
        let param = { myKey: { someValue: 'val' } };
        let output = helpers.dictToArray(param);
        expect(output).toEqual([{ id: 'myKey', someValue: 'val' }]);
    });

    test('helpers.arrayToDic-positive', () => {
        let param = [1, 2, 'hello'];
        let output = helpers.arrayToDic(param as []);
        expect(output).toEqual({ 1: true, 2: true, hello: true });
    });
});

describe.only('helpers.parseUrl', () => {
    test('helpers.parseUrl-simple-positive', () => {
        let output = helpers.parseUrl('http://domain.com/my-service/resource/id112233?queryParam1=1&queryParam2=aa');
        expect(output).toMatchObject({
            domainExt: 'com',
            domainName: 'domain',
            subdomain: undefined,
            protocol: 'http',
            path: 'my-service/resource/id112233',
            queryParams: 'queryParam1=1&queryParam2=aa',
            segments: ['my-service', 'resource', 'id112233'],
            params: {
                queryParam1: '1',
                queryParam2: 'aa',
            },
        });
    });

    test('helpers.parseUrl-subdomain-positive', () => {
        let output = helpers.parseUrl('http://sub.domain.com/my-service/resource/id112233?queryParam1=1&queryParam2=aa');
        expect(output).toMatchObject({
            domainExt: 'com',
            domainName: 'domain',
            subdomain: 'sub',
            protocol: 'http',
            path: 'my-service/resource/id112233',
            queryParams: 'queryParam1=1&queryParam2=aa',
            segments: ['my-service', 'resource', 'id112233'],
            params: {
                queryParam1: '1',
                queryParam2: 'aa',
            },
        });
    });

    test('helpers.parseUrl-subsubdomain-positive', () => {
        let output = helpers.parseUrl('http://sub2.sub.domain.com/my-service/resource/id112233?queryParam1=1&queryParam2=aa');
        expect(output).toMatchObject({
            domainExt: 'com',
            domainName: 'domain',
            subdomain: 'sub2.sub',
            protocol: 'http',
            path: 'my-service/resource/id112233',
            queryParams: 'queryParam1=1&queryParam2=aa',
            segments: ['my-service', 'resource', 'id112233'],
            params: {
                queryParam1: '1',
                queryParam2: 'aa',
            },
        });
    });

    test('helpers.parseUrl-onlyPath-positive', () => {
        let output = helpers.parseUrl('/my-service/resource/id112233?queryParam1=1&queryParam2=aa');
        expect(output).toMatchObject({
            path: 'my-service/resource/id112233',
            queryParams: 'queryParam1=1&queryParam2=aa',
            segments: ['my-service', 'resource', 'id112233'],
            params: {
                queryParam1: '1',
                queryParam2: 'aa',
            },
        });
    });

    test('helpers.parseUrl-1queryParam-positive', () => {
        let output = helpers.parseUrl('/my-service/resource/id112233?queryParam1=1');
        expect(output).toMatchObject({
            path: 'my-service/resource/id112233',
            queryParams: 'queryParam1=1',
            segments: ['my-service', 'resource', 'id112233'],
            params: {
                queryParam1: '1',
            },
        });
    });

    test('helpers.parseUrl-1path-positive', () => {
        let output = helpers.parseUrl('/my-service/?queryParam1=1');
        expect(output).toMatchObject({
            path: 'my-service',
            queryParams: 'queryParam1=1',
            segments: ['my-service'],
            params: {
                queryParam1: '1',
            },
        });
    });

    test('helpers.parseUrl-noQValue-positive', () => {
        let output = helpers.parseUrl('/my-service/?queryParam1');
        expect(output).toMatchObject({
            path: 'my-service',
            queryParams: 'queryParam1',
            segments: ['my-service'],
            params: {
                queryParam1: true,
            },
        });
    });

    test('helpers.parseUrl-onlyPath-positive', () => {
        let output = helpers.parseUrl('/my-service');
        expect(output).toMatchObject({
            path: 'my-service',
            segments: ['my-service'],
        });
    });

    test('helpers.parseUrl-negative', () => {
        let output = helpers.parseUrl('my-service!@#');
        expect(output).toEqual(null);
    });

    test('helpers.parseUrl-only-query', () => {
        let output = helpers.parseUrl('?queryParam1=1');
        expect(output).toMatchObject({
            path: null,
            queryParams: 'queryParam1=1',
            segments: null,
            params: {
                queryParam1: '1',
            },
        });
    });
});

test('escapeRegExp-positive', () => {
    let output = helpers.escapeRegExp("[abc|123]*");
    expect(output).toBe('\\[abc\\|123\\]\\*');
});

test('sanitize-except 1', () => {
    const userInput = "<b>This</b> is <a href='123'>test</a>";
    const allowedTags = ['b'];

    const output = helpers.sanitize(userInput, allowedTags);
    expect(output).toBe('<b>This</b> is test');
});
test('sanitizeInput-all', () => {
    const userInput = "<b>This</b> is <a href='123'>test</a>";

    const output = helpers.sanitize(userInput);
    expect(output).toBe('This is test');
});


// test('helpers.-positive', () => {
// 	let param = { a: 1 };
// 	let output = helpers.(param);
// 	expect(output).toEqual(true);
// });
