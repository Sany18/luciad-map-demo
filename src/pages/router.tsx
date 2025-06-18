import { createBrowserRouter } from "react-router-dom";

import { BASE_PATH } from "consts/const";

import App from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  }
], {
  basename: BASE_PATH,
});
