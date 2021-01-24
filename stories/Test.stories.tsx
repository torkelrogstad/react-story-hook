import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { fireEvent } from "@testing-library/react";

import { useTestingLib } from "../src";

const info: Meta = {
  title: "Test",
};

export default info;

export const PlainStory = () => (
  <div>I'm a plain story, with no interaction</div>
);

export const WithHook = () => {
  const [state, setState] = useState(0);

  useTestingLib(async (utils) => {
    fireEvent.click(utils.getByRole("button"));
    fireEvent.click(utils.getByRole("button"));
  });

  return (
    <div>
      <button onClick={() => setState(state + 1)}>Click me</button>
      <span>I've been clicked {state} time(s)</span>
    </div>
  );
};

export const WithAsyncHook = () => {
  const [hasResolved, setHasResolved] = useState(false);

  useTestingLib(async (utils) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000); // after one second
    });

    fireEvent.click(utils.getByRole("button"));
  });

  return (
    <>
      <button onClick={() => setHasResolved(true)}>Click me</button>
      <span>Promise has resolved: {hasResolved.toString()}</span>
    </>
  );
};

export const WithActions = () => {
  return <button onClick={action("click")}>Click me</button>;
};

const template = ({ content, ...args }) => <div {...args}>{content}</div>;
export const FromTemplate = template.bind({});
FromTemplate.args = { content: "hey there" };
