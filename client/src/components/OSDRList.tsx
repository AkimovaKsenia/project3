import React from "react";
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
  Button,
  Box,
} from "@chakra-ui/react";
import { useOSDRList, useRefreshData } from "../hooks/useSpaceData";

export const OSDRList: React.FC = () => {
  const { data, isLoading } = useOSDRList(20);
  const refresh = useRefreshData();

  const handleSync = () => refresh.mutate(["osdr"]);

  return (
    <Card>
      <CardBody>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            OSDR — Oткрытые научные данные
          </Text>
          <Button
            colorScheme="blue"
            isLoading={refresh.isPending}
            onClick={handleSync}
          >
            Синхронизировать
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Название</Th>
                <Th>Статус</Th>
                <Th>Обновлено</Th>
                <Th>Добавлено</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.items?.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <Text fontSize="xs" fontFamily="mono">
                      {item.dataset_id ?? `#${item.id}`}
                    </Text>
                  </Td>
                  <Td maxW="200px" isTruncated title={item.title ?? ""}>
                    {item.title ?? "Без названия"}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        item.status?.toLowerCase().includes("complete")
                          ? "green"
                          : item.status?.toLowerCase().includes("error")
                          ? "red"
                          : "blue"
                      }
                    >
                      {item.status ?? "unknown"}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="xs">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString("ru-RU")
                        : "—"}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="xs">
                      {new Date(item.inserted_at).toLocaleDateString("ru-RU")}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {!isLoading && (!data?.items || data.items.length === 0) && (
          <Text textAlign="center" color="gray.500" py={4}>
            Нет данных OSDR
          </Text>
        )}
      </CardBody>
    </Card>
  );
};
