import _createQueue from './shared';

const createQueue = <T>(size: number) => _createQueue<T>(size, true);
export default createQueue;
