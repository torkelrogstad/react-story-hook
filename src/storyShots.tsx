import { Stories2SnapsConverter } from "@storybook/addon-storyshots";
import React from "react";
import * as rtl from "@testing-library/react";
import type { StoryshotsOptions } from "@storybook/addon-storyshots/dist/api/StoryshotsOptions";

import { allTests } from "./common";
import { StoryShotsContext } from "./context";
import { getPromiseAndResolver } from "./promises";

type Args = {
  /**
   * If this is true, don't read/write snapshots against a on-disk file.
   * This is useful if you just want to test that you can render all your
   * stories, but don't want to maintain snapshots.
   */
  noFileSnapshot?: boolean;
};
type StoryShotsTest = (args?: Args) => StoryshotsOptions["test"];

const testsThatHasAssertedOnOutput = new Set<string>();

/** TODO: is it possible to query for Jest timeout? */
const timeout = 5000;
jest.setTimeout(timeout);

/**
 * Render all your stories with React Testing Library, and assert that the output
 * matches a snapshot. If you have used the `useTestingLib` hook, we wait until
 * your hook callback has returned and resolved.
 */
export const storyShotsTest: StoryShotsTest = ({ noFileSnapshot } = {}) => ({
  story,
  context,
  done,
}) => {
  const checkFileSnapshot = !noFileSnapshot;
  if (!done) {
    throw Error("Async Jest is not enabled");
  }

  // avoid importing a Node.js specific library in the browser
  const converter = new Stories2SnapsConverter();
  const snapshotFilename = converter.getSnapshotFileName(context);

  allTests.set(context.id, {
    done,
    filename: snapshotFilename,
    hasUsedHook: false,
    hasAsserted: false,
    checkFileSnapshot,
  });

  const Story = story.storyFn;
  const [callAfterRender, awaitBeforeCallback] = getPromiseAndResolver();
  const rendered = rtl.render(
    <StoryShotsContext.Provider
      value={{
        awaitBeforeCallback,
        callAfterCallback: () => {
          //
        },
        id: context.id,
      }}
    >
      <div id="root">
        <Story {...context} />
      </div>
    </StoryShotsContext.Provider>
  );
  callAfterRender();

  if (allTests.get(context.id)?.hasUsedHook) {
    setTimeout(() => {
      if (!testsThatHasAssertedOnOutput.has(context.id)) {
        done(); // to avoid errors from both fail and "timeout exceeded" from Jest
        throw Error(
          `Story '${context.name}' in ${context.fileName} did not assert on output within the ${timeout}ms timeout`
        );
      }
    }, timeout);
  } else {
    if (checkFileSnapshot) {
      expect(rendered).toMatchSpecificSnapshot(snapshotFilename);
    }
    done();
    return;
  }
};
