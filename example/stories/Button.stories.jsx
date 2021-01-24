import React from "react";
import { fireEvent } from "@testing-library/dom";
import { useTestingLib } from "react-story-hook";

import { Button } from "./Button";

export default {
  title: "Example/Button",
  component: Button,
};

export const button = () => {
  useTestingLib(async (utils) => {
    const button = utils.getByRole("button");
    Array.from({ length: 5 }).forEach(() => {
      fireEvent.click(button);
    });
  });
  return <Button />;
};
