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
import { extractOSDRData } from "../utils/osdr";
import { useFilteredOSDR } from "../hooks/useFilteredOSDR";
import { OSDRSearch } from "./search/OSDRSearch";
import { OSDFilters } from "./filters/OSDFilters";

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

  const filteredItems = useFilteredOSDR(data?.items, searchQuery, searchField);

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

          <OSDRSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchField={searchField}
            setSearchField={setSearchField}
          />

          <OSDFilters
            sortBy={sortBy}
            order={order}
            limit={limit}
            onSortByChange={setSortBy}
            onOrderChange={setOrder}
            onLimitChange={setLimit}
            onReset={handleResetFilters}
            filteredCount={filteredItems.length}
            totalCount={data?.items?.length || 0}
          />

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
