export interface PromiseWithResolver {
  /** This function should be called after the story manipulation callback has finished */
  callAfterCallback: VoidPromiseResolver;

  /** This promise should be awaited before running the story manipulation callback */
  awaitBeforeCallback: Promise<void>;
}

export type VoidPromiseResolver = (value: void | PromiseLike<void>) => void;

/** Returns a promise and a function that causes the promise to resolve */
export const getPromiseAndResolver = (): readonly [
  VoidPromiseResolver,
  Promise<void>
] => {
  let resolveFunc: VoidPromiseResolver | undefined;
  const promise = new Promise<void>((resolve) => (resolveFunc = resolve));

  // TODO: does this always work? can make this async if needed
  if (resolveFunc === undefined) {
    throw Error("Resolve function was undefined!");
  }
  return [resolveFunc, promise];
};
