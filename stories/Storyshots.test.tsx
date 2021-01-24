import initStoryshots from "@storybook/addon-storyshots";
import { storyShotsTest } from "../src/storyShots";
import { snapshotSerializer } from "../src/serializer";

initStoryshots({
  asyncJest: true,
  test: storyShotsTest({ noFileSnapshot: true }),
  snapshotSerializers: [snapshotSerializer],
});
