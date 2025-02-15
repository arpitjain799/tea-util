import Client, { RuntimeOptions } from '../src/client';

import { Readable } from 'stream';
import * as $tea from '@alicloud/tea-typescript';
import assert from 'assert';
import 'mocha';
import { platform, arch } from 'os';

class MyReadable extends Readable {
    value: Buffer

    constructor(value: Buffer) {
        super();
        this.value = value;
    }

    _read() {
        this.push(this.value);
        this.push(null);
    }
}

describe('Tea Util', function () {
    it('Module should ok', function () {
        assert.ok(Client);
    });

    it('defaultNumber should ok', function () {
        assert.deepStrictEqual(Client.defaultNumber(10, 2), 10);
        assert.deepStrictEqual(Client.defaultNumber(undefined, 2), 2);
    });

    it('toJSONString should ok', function () {
        assert.deepStrictEqual(Client.toJSONString({}), '{}');
        assert.deepStrictEqual(Client.toJSONString({ 'str': 'test', 'number': 1, 'bool': false, 'null': null }), '{"str":"test","number":1,"bool":false,"null":null}');
        assert.deepStrictEqual(Client.toJSONString([]), '[]');
        assert.deepStrictEqual(Client.toJSONString('test str'), 'test str');
        assert.deepStrictEqual(Client.toJSONString(1), '1');
        assert.deepStrictEqual(Client.toJSONString(true), 'true');
        assert.deepStrictEqual(Client.toJSONString(null), 'null');
    });

    it('defaultString should ok', function () {
        assert.deepStrictEqual(Client.defaultString('', 'default'), 'default');
        assert.deepStrictEqual(Client.defaultString('input', 'default'), 'input');
    });

    it('toFormString should ok', function () {
        assert.deepStrictEqual(Client.toFormString({}), '');
        assert.deepStrictEqual(Client.toFormString({ a: 'b c d' }), 'a=b%20c%20d');
    });

    it('toString', function () {
        assert.deepStrictEqual(Client.toString(Buffer.from('Hello world!')), 'Hello world!');
    });

    it('toBytes', function () {
        assert.deepStrictEqual(Client.toBytes('Hello world!'), Buffer.from('Hello world!'));
    });

    it('equalString', function () {
        assert.deepStrictEqual(Client.equalString('100', '120'), false);
        assert.deepStrictEqual(Client.equalString('100', '100'), true);
    });

    it('equalNumber', function () {
        assert.deepStrictEqual(Client.equalNumber(100, 120), false);
        assert.deepStrictEqual(Client.equalNumber(100, 100), true);
    });

    it('readAsJSON', async function () {
        const readable = new MyReadable(Buffer.from(JSON.stringify({ 'a': 'b' })));
        const result = await Client.readAsJSON(readable);
        assert.deepStrictEqual(result, { 'a': 'b' });
    });

    it('readAsBytes', async function () {
        const readable = new MyReadable(Buffer.from(JSON.stringify({ 'a': 'b' })));
        const result = await Client.readAsBytes(readable);
        assert.deepStrictEqual(result, Buffer.from('{"a":"b"}'));
    });

    it('readAsString', async function () {
        const readable = new MyReadable(Buffer.from(JSON.stringify({ 'a': 'b' })));
        const result = await Client.readAsString(readable);
        assert.deepStrictEqual(result, '{"a":"b"}');
    });

    it('getDateUTCString', function () {
        let regexp = /[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT/;
        assert.ok(regexp.test(Client.getDateUTCString()));
    });

    it('empty', function () {
        assert.deepStrictEqual(Client.empty(''), true);
    });

    it('isUnset', function () {
        assert.deepStrictEqual(Client.isUnset(null), true);
        assert.deepStrictEqual(Client.isUnset(undefined), true);
        assert.deepStrictEqual(Client.isUnset(false), false);
        assert.deepStrictEqual(Client.isUnset({}), false);
    });

    it('getNonce', function () {
        const nonce0 = Client.getNonce();
        const nonce1 = Client.getNonce();
        const nonce2 = Client.getNonce();
        const nonce3 = Client.getNonce();
        const nonce4 = Client.getNonce();
        assert.notDeepStrictEqual(nonce0, nonce1);
        assert.notDeepStrictEqual(nonce1, nonce2);
        assert.notDeepStrictEqual(nonce2, nonce3);
        assert.notDeepStrictEqual(nonce3, nonce4);
    });

    it('RuntimeOptions', function () {
        let opts = new RuntimeOptions();
        assert.ok(opts);
        const casted = $tea.cast({}, opts);
        assert.ok(casted);
        opts = new RuntimeOptions(
            {
                autoretry: false,
                ignoreSSL: false,
                key: 'key',
                cert: 'cert',
                ca: 'ca',
                maxAttempts: 3,
                backoffPolicy: 'backoffPolicy',
                backoffPeriod: 10,
                readTimeout: 3000,
                connectTimeout: 3000,
                httpProxy: 'httpProxy',
                httpsProxy: 'httpsProxy',
                noProxy: 'noProxy',
                maxIdleConns: 300,
                keepAlive: true,
            }
        );
        assert.ok(opts.autoretry === false);
        assert.ok(opts.ignoreSSL === false);
        assert.ok(opts.key === 'key');
        assert.ok(opts.cert === 'cert');
        assert.ok(opts.ca === 'ca');
        assert.ok(opts.maxAttempts === 3);
        assert.ok(opts.backoffPolicy === 'backoffPolicy');
        assert.ok(opts.backoffPeriod === 10);
        assert.ok(opts.readTimeout === 3000);
        assert.ok(opts.connectTimeout === 3000);
        assert.ok(opts.httpProxy === 'httpProxy');
        assert.ok(opts.httpsProxy === 'httpsProxy');
        assert.ok(opts.maxIdleConns === 300);
        assert.ok(opts.keepAlive === true);
    });

    it('stringifyMapValue', function () {
        assert.deepStrictEqual(Client.stringifyMapValue({}), {});
        assert.deepStrictEqual(Client.stringifyMapValue({ 'number': 100 }), { 'number': '100' });
        assert.deepStrictEqual(Client.stringifyMapValue({ 'bool': true }), { 'bool': 'true' });
        assert.deepStrictEqual(Client.stringifyMapValue({
            'bool': true,
            'string': 'str',
            'number': '0',
            'null': null,
            'undefined': undefined
        }), {
            'bool': 'true',
            'string': 'str',
            'number': '0'
        });
        assert.deepStrictEqual(Client.stringifyMapValue(null), null);
    });

    it('anyifyMapValue', function () {
        assert.deepStrictEqual(Client.anyifyMapValue({}), {});
        assert.deepStrictEqual(Client.anyifyMapValue({ 'number': '100' }), { 'number': '100' });
        assert.deepStrictEqual(Client.anyifyMapValue({ 'string': 'string' }), { 'string': 'string' });
        assert.deepStrictEqual(Client.anyifyMapValue(null), null);
    });

    it('assertAsBoolean', function () {
        assert.deepStrictEqual(Client.assertAsBoolean(true), true);
        assert.deepStrictEqual(Client.assertAsBoolean(false), false);
        assert.throws(() => {
            Client.assertAsBoolean('true');
        }, /The value is not a boolean/);
        assert.throws(() => {
            Client.assertAsBoolean('false');
        }, /The value is not a boolean/);
        assert.throws(() => {
            Client.assertAsBoolean(undefined);
        }, /The value is not a boolean/);
    });

    it('assertAsString', function () {
        assert.deepStrictEqual(Client.assertAsString('string'), 'string');
        assert.deepStrictEqual(Client.assertAsString(''), '');
        assert.throws(() => {
            Client.assertAsString(1);
        }, /The value is not a string/);
        assert.throws(() => {
            Client.assertAsString(true);
        }, /The value is not a string/);
        assert.throws(() => {
            Client.assertAsString(undefined);
        }, /The value is not a string/);
    });

    it('assertAsNumber', function () {
        assert.deepStrictEqual(Client.assertAsNumber(1), 1);
        assert.deepStrictEqual(Client.assertAsNumber(-1), -1);
        assert.deepStrictEqual(Client.assertAsNumber(0), 0);
        assert.throws(() => {
            Client.assertAsNumber('1');
        }, /The value is not a number/);
        assert.throws(() => {
            Client.assertAsNumber(true);
        }, /The value is not a number/);
        assert.throws(() => {
            Client.assertAsNumber(undefined);
        }, /The value is not a number/);
    });

    it('assertAsMap', function () {
        assert.deepStrictEqual(Client.assertAsMap({}), {});
        assert.throws(() => {
            Client.assertAsMap([]);
        }, /The value is not a object/);
        assert.throws(() => {
            Client.assertAsMap(true);
        }, /The value is not a object/);
        assert.throws(() => {
            Client.assertAsMap(123);
        }, /The value is not a object/);
    });

    it('assertAsArray', function () {
        assert.deepStrictEqual(Client.assertAsArray([]), []);
        assert.throws(() => {
            Client.assertAsArray({});
        }, /The value is not array/);
        assert.throws(() => {
            Client.assertAsArray(true);
        }, /The value is not array/);
        assert.throws(() => {
            Client.assertAsArray(123);
        }, /The value is not array/);
    });

    it('assertAsBytes', function () {
        assert.deepStrictEqual(Client.assertAsBytes(Buffer.from('test')), Buffer.from('test'));
        assert.throws(() => {
            Client.assertAsBytes(10);
        }, /The value is not bytes/);
        assert.throws(() => {
            Client.assertAsBytes(true);
        }, /The value is not bytes/);
        assert.throws(() => {
            Client.assertAsBytes('123');
        }, /The value is not bytes/);
    });

    it('getUserAgent', function () {
        assert.strictEqual(Client.getUserAgent(''), `AlibabaCloud (${platform()}; ${arch()}) Node.js/${process.version} Core/1.0.1 TeaDSL/1`);
        assert.strictEqual(Client.getUserAgent('2019'), `AlibabaCloud (${platform()}; ${arch()}) Node.js/${process.version} Core/1.0.1 TeaDSL/1 2019`);
    });

    it('is2xx', function () {
        assert.strictEqual(Client.is2xx(200), true);
        assert.strictEqual(Client.is2xx(222), true);
        assert.strictEqual(Client.is2xx(199), false);
        assert.strictEqual(Client.is2xx(300), false);
    });

    it('is3xx', function () {
        assert.strictEqual(Client.is3xx(300), true);
        assert.strictEqual(Client.is3xx(322), true);
        assert.strictEqual(Client.is3xx(299), false);
        assert.strictEqual(Client.is3xx(400), false);
    });

    it('is4xx', function () {
        assert.strictEqual(Client.is4xx(400), true);
        assert.strictEqual(Client.is4xx(422), true);
        assert.strictEqual(Client.is4xx(399), false);
        assert.strictEqual(Client.is4xx(500), false);
    });


    it('is5xx', function () {
        assert.strictEqual(Client.is5xx(500), true);
        assert.strictEqual(Client.is5xx(522), true);
        assert.strictEqual(Client.is5xx(499), false);
        assert.strictEqual(Client.is5xx(600), false);
    });

    it('validate', function () {
        // assert.ok(Client.validateModel(new $tea.Model({ test: 'test' })));
    });

    it('toMap', function () {
        class TestModel extends $tea.Model {
            test: string;
            static names(): { [key: string]: string } {
                return {
                    test: 'test',
                };
            }

            static types(): { [key: string]: any } {
                return {
                    test: 'string',
                };
            }

            constructor(map: { [key: string]: any }) {
                super(map);
            }
        }
        let inputModel = new TestModel({ test: 'testValue' });
        let result = Client.toMap(inputModel);
        assert.strictEqual(result['test'], 'testValue');
    });


    it('sleep', async function () {
        assert.strictEqual(await Client.sleep(1000), undefined);
    });

    it('toArray', async function () {
        class TestModel extends $tea.Model {
            test: string;
            static names(): { [key: string]: string } {
                return {
                    test: 'test',
                };
            }

            static types(): { [key: string]: any } {
                return {
                    test: 'string',
                };
            }

            constructor(map: { [key: string]: any }) {
                super(map);
            }
        }
        let inputModel = new TestModel({ test: 'testValue' });
        let input: any = [inputModel];
        assert.deepStrictEqual(Client.toArray(input), [{
            test: 'testValue'
        }]);
        assert.deepStrictEqual(Client.toArray(inputModel), null);
        assert.deepStrictEqual(Client.toArray(undefined), null);
        assert.deepStrictEqual(Client.toArray(null), null);
    });
});
