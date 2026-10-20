import { expect, test } from 'vitest'

// libx itself must work when the consumer opts out of prototype extensions.
test('opt-out: no prototype writes, modules still work', async () => {
    (<any>globalThis)._libx_avoidExtensions = true;
    const { libx } = await import('../../src/bundles/essentials');
    const { log } = await import('../../src/modules/log');
    const { Cache } = await import('../../src/modules/Cache');
    expect((<any>'x').replaceAt).toBeUndefined();
    expect((<any>new Date()).format).toBeUndefined();
    expect(log.color('hi', <any>'red')).toContain('hi');
    log.isShowTime = true;
    expect(() => log.info('opt-out ok')).not.toThrow();
    expect(new Cache('t', undefined, undefined, {} as any).setExpiry('k', 1000).getTime()).toBeGreaterThan(Date.now());
    expect(libx).toBeTruthy();
});
