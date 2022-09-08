import _createQueue from './shared';

const createQueue = <T>(size: number) => _createQueue<T>(size, false);
export default createQueue;
