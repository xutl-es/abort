import { describe, it, before } from '@xutl/test';
import assert from 'assert';

import Abort, { AbortError } from '../';
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('abort', () => {
	it('can be aborted', async () => {
		const abort = new Abort();
		const sleepy = abort.abortable(sleep(1000));
		try {
			await abort.abort();
			await sleepy;
		} catch (e) {
			assert(e instanceof AbortError);
			assert.strictEqual(e.message, 'aborted');
			return;
		}
		assert.fail('should not get here');
	});
	it('can be timed-out', async () => {
		const abort = new Abort();
		const sleepy = abort.abortable(sleep(1000));
		try {
			await abort.timeout(1);
			await sleepy;
		} catch (e) {
			assert(e instanceof AbortError);
			assert.strictEqual(e.message, 'aborted');
			return;
		}
		assert.fail('should not get here');
	});
	it('waits for abortion', async () => {
		const abort = new Abort();
		let done = false;
		abort.signal.onabort = async () => {
			await sleep(100);
			done = true;
		};
		const aborted = abort.abort();
		assert(!done);
		await aborted;
		assert(done);
	});
});
