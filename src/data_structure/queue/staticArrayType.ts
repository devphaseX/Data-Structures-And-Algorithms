import _createQueue from './shared.js';

const createQueue = <T>(size: number) => _createQueue<T>(size, false);
export default createQueue;
