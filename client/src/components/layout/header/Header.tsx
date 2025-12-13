import { NavLink } from "react-router-dom";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";

const navItems = [
  { to: "/", label: "Орбитальные данные" },
  //   { to: "/iss", label: "ISS" },
  { to: "/osdr", label: "Oткрытые научные данные" },
  { to: "/space", label: "Космическая сводка" },
];

const Header = () => {
  return (
    <Box
      as="header"
      h="70px"
      bg="gray.900"
      color="white"
      borderBottom="1px solid"
      borderColor="gray.700"
    >
      <Flex
        h="100%"
        px={8}
        align="center"
        justify="space-between"
        maxW="1200px"
        mx="auto"
      >
        <Text fontWeight="bold" fontSize="lg">
          🚀 Space Dashboard
        </Text>

        <HStack spacing={8}>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <Text
                  fontSize="m"
                  fontWeight="medium"
                  color={isActive ? "blue.300" : "gray.300"}
                  borderBottom={
                    isActive ? "2px solid" : "2px solid transparent"
                  }
                  borderColor="blue.300"
                  pb="2px"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                >
                  {label}
                </Text>
              )}
            </NavLink>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
