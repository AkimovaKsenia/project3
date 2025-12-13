import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { Box } from "@chakra-ui/react";
import Header from "./header/Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/auth";

  return (
    <Box minH="100vh" bg="gray.50">
      {!isAuthPage && <Header />}

      <Box as="main" minW="1335px" maxW="1335px" mx="auto" px={8} py={8}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
