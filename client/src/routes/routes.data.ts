import { lazy } from "react";
// const Home = lazy(() => import("../App"));
// const Space = lazy(() => import("../screens/Space"));
import ISSPage from "../screens/Space";
import Home from "../App";
import OSDRPage from "../screens/OSDRPage";
import SpaceCardData from "../screens/SpaceCardData";

export const routesData = [
  {
    title: "Home",
    path: "/",
    component: Home,
  },
  // {
  //   title: "ISSPage",
  //   path: "/iss",
  //   component: ISSPage,
  // },
  {
    title: "OSDRPage",
    path: "/osdr",
    component: OSDRPage,
  },
  {
    title: "SpaceCardData",
    path: "/space",
    component: SpaceCardData,
  },
];
