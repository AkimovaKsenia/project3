import { Box, InputGroup, Input, HStack, Badge } from "@chakra-ui/react";

interface OSDRSearchProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchField: "all" | "dataset_id" | "title";
  setSearchField: (v: "all" | "dataset_id" | "title") => void;
}

export const OSDRSearch: React.FC<OSDRSearchProps> = ({
  searchQuery,
  setSearchQuery,
  searchField,
  setSearchField,
}) => (
  <Box>
    <InputGroup size="md">
      <Input
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        bg="white"
      />
    </InputGroup>

    <HStack mt={4} spacing={2} mb={4}>
      <Badge
        as="button"
        cursor="pointer"
        colorScheme={searchField === "all" ? "blue" : "gray"}
        onClick={() => setSearchField("all")}
        _hover={{ opacity: 0.8 }}
      >
        Все поля
      </Badge>
      <Badge
        as="button"
        cursor="pointer"
        colorScheme={searchField === "dataset_id" ? "blue" : "gray"}
        onClick={() => setSearchField("dataset_id")}
        _hover={{ opacity: 0.8 }}
      >
        Только Dataset ID
      </Badge>
      <Badge
        as="button"
        cursor="pointer"
        colorScheme={searchField === "title" ? "blue" : "gray"}
        onClick={() => setSearchField("title")}
        _hover={{ opacity: 0.8 }}
      >
        Только названия
      </Badge>

      {searchQuery && (
        <Badge
          as="button"
          cursor="pointer"
          colorScheme="red"
          onClick={() => setSearchQuery("")}
          _hover={{ opacity: 0.8 }}
        >
          Очистить поиск
        </Badge>
      )}
    </HStack>
  </Box>
);
