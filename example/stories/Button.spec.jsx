require("@testing-library/jest-dom");

const { renderStory } = require("react-story-hook");
const { button: Button } = require("./Button.stories");

test("button is clicked", async () => {
  const utils = await renderStory(Button);
  expect(utils.getByRole("button")).toHaveTextContent("Click(s): 5");
});
