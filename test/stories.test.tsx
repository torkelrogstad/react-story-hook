import {
  FromTemplate,
  PlainStory,
  WithActions,
  WithAsyncHook,
  WithHook,
} from "../stories/Test.stories";

import { renderStory } from "../src";

test("PlainStory", async () => {
  const utils = await renderStory(PlainStory);
  utils.getByText(/I'm a plain story/);
});

test("WithHook", async () => {
  const utils = await renderStory(WithHook);

  utils.getByText("I've been clicked 2 time(s)");
  expect(utils.queryByText("I've been clicked 2 time(s)")).toBeDefined();
});

test("WithAsyncHook", async () => {
  const utils = await renderStory(WithAsyncHook);

  utils.getByText("Promise has resolved: true");
});

test("WithAction", async () => {
  const utils = await renderStory(WithActions);
  utils.getByRole("button");
});

test("FromTemplate", async () => {
  const utils = await renderStory(FromTemplate);
  utils.getByText("hey there");
});
