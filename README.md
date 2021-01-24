# `react-story-hook`

> **Experimental** React hook for use React Testing library in a unified way
> with StoryBook stories, StoryShots and Jest testing.

This library exposes a function `useTestingLib`, that lets you do three things:

1. Manipulate stories with React Testing Library
2. Assert on your manipulated stories in Jest tests
3. Verify that your rendered and manipulated stories match snapshots, with
   StoryShots.

## Examples

> These examples are cribbed from this libraries tests and stories. Browse the
> `stories` and `test` directories to view more.

```js
// in a story file
import { useTestingLib } from "react-story-hook";
import { fireEvent } from "@testing-library/react";

export const Story = () => {
  const [state, setState] = useState(0);

  /**
   * The callback you provide here receive React Testing Library queries
   * as its parameter, bound to the current story. You can use this to
   * manipulate your stories.
   */
  useTestingLib(async (utils) => {
    fireEvent.click(utils.getByRole("button"));
  });

  /** The span will have content "I've been clicked 1 time(s)" */
  return (
    <div>
      <button onClick={() => setState(state + 1)}>Click me</button>
      <span>I've been clicked {state} time(s)</span>
    </div>
  );
};

// in a Jest test file
import { renderStory } from "react-story-hook";
import { Story } from "./your.stories.jsx"; // file from above!
test("my story", async () => {
  const utils = await renderStory(Story);
  expect(utils.queryByText("I've been clicked 1 time(s)")).toBeDefined();
});

// in a file for setting up StoryShots
import initStoryshots from "@storybook/addon-storyshots";
import { storyShotsTest, snapshotSerializer } from "react-story-hook";

initStoryshots({
  asyncJest: true,
  test: storyShotsTest({
    noFileSnapshot: false, // controls if we're comparing against a snapshot on disk or not
  }),
  snapshotSerializers: [snapshotSerializer],
});
```

## Limitations

- Args does not work as they do in StoryBook, where event handlers automatically
  get functions that fit them
- It would be nice to apply decorators from default exports to rendered stories,
  this is not the case
- When we run into issues, sometimes wrong tests show up as failed. I'm not sure
  why this is the case.
