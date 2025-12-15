import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Box,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useOSDRList, useSyncOSDR } from "../hooks/useSpaceData";
import type { OSDRQueryParams } from "../types/api";

const extractOSDRData = (item: any) => {
  const raw = item.raw || {};

  return {
    dataset_id: item.dataset_id || "N/A",
    title: item.dataset_id || "Без названия",
    status: "available",
    updated_at: item.updated_at || null,
    rest_url: raw.REST_URL || "",
  };
};

export const OSDRList: React.FC = () => {
  const [sortBy, setSortBy] =
    useState<OSDRQueryParams["sort_by"]>("inserted_at");
  const [order, setOrder] = useState<OSDRQueryParams["order"]>("desc");
  const [limit, setLimit] = useState(20);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<
    "dataset_id" | "title" | "all"
  >("all");

  const params: OSDRQueryParams = {
    limit,
    sort_by: sortBy,
    order: order,
  };

  const { data, isLoading, refetch } = useOSDRList(params);
  const syncOSDR = useSyncOSDR();

  const handleSync = () => {
    syncOSDR.mutate(undefined);
  };

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    if (!searchQuery.trim()) return data.items;

    const query = searchQuery.toLowerCase().trim();

    return data.items.filter((item) => {
      const extracted = extractOSDRData(item);

      switch (searchField) {
        case "dataset_id":
          return extracted.dataset_id.toLowerCase().includes(query);
        case "title":
          return extracted.title.toLowerCase().includes(query);
        case "all":
        default:
          return (
            extracted.dataset_id.toLowerCase().includes(query) ||
            extracted.title.toLowerCase().includes(query) ||
            extracted.rest_url.toLowerCase().includes(query)
          );
      }
    });
  }, [data?.items, searchQuery, searchField]);

  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field as any);
      setOrder("desc");
    }
  };

  const handleResetFilters = () => {
    setSortBy("inserted_at");
    setOrder("desc");
    setLimit(20);
    setSearchQuery("");
    setSearchField("all");
  };

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold">
              OSDR — Открытые научные данные
            </Text>
            <HStack>
              <Button
                colorScheme="blue"
                isLoading={syncOSDR.isPending}
                onClick={handleSync}
                size="sm"
              >
                Синхронизировать
              </Button>
            </HStack>
          </HStack>

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

          <Box mb={4}>
            <SimpleGrid columns={3} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Сортировка по</FormLabel>
                <Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
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
                  onChange={(e) => setOrder(e.target.value as any)}
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
                  onChange={(e) => setLimit(Number(e.target.value))}
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetFilters}
                colorScheme="gray"
              >
                Сбросить все фильтры
              </Button>

              <Text fontSize="sm" color="gray.600">
                Найдено: {filteredItems.length} из {data?.items?.length || 0}
              </Text>
            </HStack>
          </Box>

          <Box overflowX="auto" position="relative">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSortClick("id")}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing={1}>
                      <Text>ID</Text>
                      {sortBy === "id" && (
                        <Text>{order === "asc" ? "↑" : "↓"}</Text>
                      )}
                    </HStack>
                  </Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSortClick("dataset_id")}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing={1}>
                      <Text>Dataset ID</Text>
                      {sortBy === "dataset_id" && (
                        <Text>{order === "asc" ? "↑" : "↓"}</Text>
                      )}
                    </HStack>
                  </Th>
                  <Th>Название</Th>
                  <Th>Статус</Th>
                  <Th>REST URL</Th>
                  <Th
                    cursor="pointer"
                    onClick={() => handleSortClick("inserted_at")}
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing={1}>
                      <Text>Добавлено</Text>
                      {sortBy === "inserted_at" && (
                        <Text>{order === "asc" ? "↑" : "↓"}</Text>
                      )}
                    </HStack>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems.map((item) => {
                  const extracted = extractOSDRData(item);

                  return (
                    <Tr key={item.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <Text fontSize="xs" fontFamily="mono">
                          #{item.id}
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="blue.600"
                        >
                          {extracted.dataset_id}
                        </Text>
                      </Td>
                      <Td maxW="200px" title={extracted.title}>
                        <Text isTruncated>Набор данных {extracted.title}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            extracted.status?.toLowerCase().includes("complete")
                              ? "green"
                              : extracted.status
                                  ?.toLowerCase()
                                  .includes("error")
                              ? "red"
                              : "blue"
                          }
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {extracted.status}
                        </Badge>
                      </Td>
                      <Td maxW="250px">
                        {extracted.rest_url ? (
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            isTruncated
                            title={extracted.rest_url}
                            color="blue.500"
                            cursor="pointer"
                            onClick={() =>
                              window.open(extracted.rest_url, "_blank")
                            }
                            _hover={{ textDecoration: "underline" }}
                          >
                            {extracted.rest_url.length > 40
                              ? extracted.rest_url.substring(0, 40) + "..."
                              : extracted.rest_url}
                          </Text>
                        ) : (
                          <Text fontSize="xs" color="gray.500">
                            Нет URL
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="xs">
                          {new Date(item.inserted_at).toLocaleDateString(
                            "ru-RU",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            {!isLoading && filteredItems.length === 0 && searchQuery && (
              <Box p={8} textAlign="center">
                <Text color="gray.500">
                  По запросу "{searchQuery}" ничего не найдено
                </Text>
              </Box>
            )}
          </Box>

          {data?.items && (
            <HStack justify="space-between" fontSize="sm" color="gray.600">
              <Text>
                Сортировка:{" "}
                {sortBy === "inserted_at"
                  ? "дата добавления"
                  : sortBy === "dataset_id"
                  ? "Dataset ID"
                  : "ID"}
                , по {order === "asc" ? "возрастанию" : "убыванию"}
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
