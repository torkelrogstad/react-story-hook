import * as rtl from "@testing-library/react";
import React, { PropsWithChildren, useContext, useEffect } from "react";
import { allTests } from "./common";
import { RenderStoryInTestContext, StoryShotsContext } from "./context";
import { getPromiseAndResolver } from "./promises";

export { snapshotSerializer } from "./serializer";
export type { storyShotsTest } from "./storyShots";

const HookDetector: React.FC = ({ children }) => {
  const fromTestContext = useContext(RenderStoryInTestContext);
  if (!fromTestContext) {
    throw Error("Could not get hook context context");
  }

  const { id } = fromTestContext;
  setImmediate(() => {
    // let hook handle completion
    if (jestTestsWithHook.has(id)) {
      return;
    }

    // this triggers completion
    fromTestContext.callAfterCallback();
  });

  return <>{children}</>;
};

const randomID = (): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function isTemplate<Props>(story: Story<Props>): story is StoryTemplate<Props> {
  return story.name.startsWith("bound ") && "args" in story;
}

type Story<Props> = (props: PropsWithChildren<Props>) => React.ReactElement;
type StoryTemplate<Props> = Story<Props> & { args: PropsWithChildren<Props> };

/**
 * Render a StoryBook story in a Jest test, and perform assertions on the output
 * once any manipulations from `useTestingLib` has finished.
 */
export async function renderStory<Props>(
  Ui: Story<Props>,
  args?: Props
): Promise<RtlUtils> {
  const [callAfterRender, awaitBeforeCallback] = getPromiseAndResolver();
  const [callAfterCallback, awaitBeforeReturning] = getPromiseAndResolver();

  // if story is template, it expects some args
  const props = isTemplate(Ui) ? Ui.args : args;

  const utils = rtl.render(
    <RenderStoryInTestContext.Provider
      value={{
        id: randomID(),
        callAfterCallback,
        awaitBeforeCallback,
      }}
    >
      <HookDetector>
        <div id="root">
          <Ui {...(props as Props)} />
        </div>
      </HookDetector>
    </RenderStoryInTestContext.Provider>
  );
  callAfterRender();

  await awaitBeforeReturning;

  if (!(utils.baseElement instanceof HTMLElement)) {
    throw Error(`Unexpected base element: ${utils.baseElement}`);
  }
  return createRtlUtils(utils.baseElement);
}

/** Used to keep track if which tests _did not_ use the `useTestingLib` hook */
const jestTestsWithHook = new Map<string, boolean>();

type Debug = rtl.Screen["debug"];
type BaseRtlUtils = rtl.BoundFunctions<typeof rtl.queries>;
type RtlUtils = BaseRtlUtils & { debug: Debug; container: HTMLElement };

function createRtlUtils(root: HTMLElement): RtlUtils {
  const queries = rtl.within(root);
  return {
    ...queries,
    container: root,
    debug: (element) => {
      let toDebug = element;

      // output gets wonky if we log multiple elements, so only do this if
      // we're dealing with a single one
      if (!toDebug && root.childElementCount === 1) {
        toDebug = root.firstElementChild ?? undefined;
      }
      return rtl.screen.debug(toDebug ?? root);
    },
  };
}

const isRunningInTest = typeof jest !== "undefined";

/**
 * Hook that enables you to use React Testing Library (RTL) in your stories in two
 * ways:
 *
 * 1. Manipulate your story in StoryBook
 * 2. Manipulate and assert on your rendered story in Jest tests
 *
 * When invoking this hook in a story, you receive the set of RTL query functions,
 * bound to the root element of your story. You can use this to manipulate elements,
 * type into inputs or click buttons, to name some use cases.
 *
 * In a Jest test, you can then use `renderStory` to assert on the output of those
 * stories. `renderStory` returns a promise that resolves when the callback you
 * provided to `useTestingLib` resolves.
 *
 * Finally, this also works with StoryShots. If you use `storyShotsTest` as the parameter
 * to `test` of `initStoryShots`, the snapshot comparisons are done with your story _after_
 * it has been manipulated by this hook, in the same way as when you use `renderStory` in a
 * Jest test.
 */
export const useTestingLib = (func: (utils: RtlUtils) => void): void => {
  const fromStoryShotContext = useContext(StoryShotsContext);
  if (fromStoryShotContext) {
    const { id } = fromStoryShotContext;
    const fromMap = allTests.get(id);
    if (!fromMap) {
      throw Error(`Did not find test ${id} in map of tests`);
    }
    allTests.set(id, { ...fromMap, hasUsedHook: true });
  }

  const fromTestContext = useContext(RenderStoryInTestContext);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) {
      throw Error("Could not get root element!");
    }
    const queries = createRtlUtils(root);

    // We're in a Jest unit test
    if (fromTestContext) {
      jestTestsWithHook.set(fromTestContext.id, true);

      /**
       * This is a bit wonky, but what we're fixing here is
       * that the renderer used by RTL cannot have overlapping
       * act(...) calls. We therefore need to make sure that
       * things happen in the correct order:
       *
       * 1. The story renders
       * 2. We run all queries that the user initiated through
       *    the `useTestingLib` hook
       * 3. Queries used in the actual test run
       *
       * This callback and promise pair help us coordinate these
       * actions.
       */
      fromTestContext.awaitBeforeCallback
        .then(() => func(queries))
        .then(() => fromTestContext.callAfterCallback());
      return;
    }

    // Storybook Story
    if (process.env.STORYBOOK === "true") {
      // trigger callback provided by user
      func(queries);
      return;
    }

    // At this point we're in a StoryShot test
    if (!fromStoryShotContext) {
      if (isRunningInTest) {
        throw Error("Could not get test ID");
      }

      // still need to let the queries run
      func(queries);
      return;
    }

    const { id, awaitBeforeCallback, callAfterCallback } = fromStoryShotContext;
    awaitBeforeCallback
      .then(() => func(queries))
      .then(() => {
        callAfterCallback();
        const fromMap = allTests.get(id);
        if (!fromMap) {
          throw Error(`Did not find test ${id} in map of tests`);
        }
        const { checkFileSnapshot, done, filename } = fromMap;
        if (checkFileSnapshot) {
          expect(root).toMatchSpecificSnapshot(filename);
        }
        allTests.set(id, { ...fromMap, hasAsserted: true });
        done();
      });
  }, []); //eslint-disable-line react-hooks/exhaustive-deps
};
