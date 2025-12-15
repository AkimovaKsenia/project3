import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";

interface OSDFiltersProps {
  sortBy: string | undefined;
  order: "asc" | "desc" | undefined;
  limit: number;
  onSortByChange: (value: string) => void;
  onOrderChange: (value: "asc" | "desc" | undefined) => void;
  onLimitChange: (value: number) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const OSDFilters: React.FC<OSDFiltersProps> = ({
  sortBy,
  order,
  limit,
  onSortByChange,
  onOrderChange,
  onLimitChange,
  onReset,
  filteredCount,
  totalCount,
}) => (
  <Box mb={4}>
    <SimpleGrid columns={3} spacing={4}>
      <FormControl>
        <FormLabel fontSize="sm">Сортировка по</FormLabel>
        <Select
          size="sm"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          bg="white"
        >
          <option value="inserted_at">Дате добавления</option>
          <option value="dataset_id">Dataset ID</option>
          <option value="id">ID записи</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Порядок сортировки</FormLabel>
        <Select
          size="sm"
          value={order}
          onChange={(e) => onOrderChange(e.target.value as "asc" | "desc")}
          bg="white"
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Количество записей</FormLabel>
        <Select
          size="sm"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          bg="white"
        >
          <option value={10}>10 записей</option>
          <option value={20}>20 записей</option>
          <option value={50}>50 записей</option>
          <option value={100}>100 записей</option>
        </Select>
      </FormControl>
    </SimpleGrid>

    <HStack mt={4} justify="space-between">
      <Button size="sm" variant="outline" onClick={onReset} colorScheme="gray">
        Сбросить все фильтры
      </Button>

      <Text fontSize="sm" color="gray.600">
        Найдено: {filteredCount} из {totalCount}
      </Text>
    </HStack>
  </Box>
);
