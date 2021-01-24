type ToPrint = {
  container: HTMLElement;
};

/** Serialize plugin for Jest. Can be passed to `initStoryShots`. */
export const snapshotSerializer: jest.SnapshotSerializerPlugin = {
  print: (maybeVal, serialize) => {
    const val = maybeVal as Partial<ToPrint>;
    const root = val.container?.firstChild;
    if (!(root instanceof HTMLElement) || root.id !== "root") {
      throw Error(`Unexpected root element: ${root}`);
    }
    return serialize(root);
  },
  test: (val) => Object.prototype.hasOwnProperty.call(val, "container"),
};
