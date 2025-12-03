import { NextFunction, Request, Response } from "express";
import PQueue from "p-queue";

const queues = new Map<string, PQueue>();

export function requestQueue(identifier: string) {
  let queue = queues.get(identifier);
  if (!queue) {
    //? REVIEW: what happens after the timeout?
    queue = new PQueue({ concurrency: 1, timeout: 10000 });
    queues.set(identifier, queue);
  }
  return async function (_req: Request, _res: Response, next: NextFunction) {
    await queue.add(async () => await next());
  };
}
