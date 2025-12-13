import { Route, Routes } from "react-router-dom";
import { routesData } from "./routes.data";
import { Suspense } from "react";
import NotFound from "../screens/NotFound ";

export const Router = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routesData.map((route) => {
          return (
            <Route
              key={route.title}
              path={route.path}
              element={<route.component />}
            />
          );
        })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
