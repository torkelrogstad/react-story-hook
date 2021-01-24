import React from "react";
import { PromiseWithResolver } from "./promises";

/** All StoryShots need this to coordinate their assertions and finish states */
export const StoryShotsContext = React.createContext<
  (PromiseWithResolver & { id: string }) | undefined
>(undefined);

/** All stories that you want to render in a Jest test needs this */
export const RenderStoryInTestContext = React.createContext<
  (PromiseWithResolver & { id: string }) | undefined
>(undefined);
