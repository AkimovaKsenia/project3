import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { Router } from "./routes/Router.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 60_000,
//       gcTime: 1000 * 60 * 60 * 24,
//     },
//   },
// });

// const persister = createAsyncStoragePersister({
//   storage: window.localStorage,
// });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    > */}
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ChakraProvider>
      {/* </PersistQueryClientProvider> */}
    </QueryClientProvider>
  </StrictMode>
);
