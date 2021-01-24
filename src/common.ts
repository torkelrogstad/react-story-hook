interface Test {
  done: () => void;
  hasUsedHook: boolean;
  hasAsserted: boolean;
  filename: string;
  checkFileSnapshot: boolean;
}

/** mapping from ID to test info */
export const allTests = new Map<string, Test>();
