import React from "react";
import {
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
} from "@chakra-ui/react";
import { useSpaceSummary } from "../hooks/useSpaceData";

export const SpaceDataCard: React.FC = () => {
  const { data: summary, isLoading } = useSpaceSummary();

  if (isLoading || !summary) {
    return (
      <Card>
        <CardBody>Загрузка космических данных...</CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Космическая сводка
        </Text>

        <SimpleGrid columns={2} spacing={4}>
          <Card variant="outline">
            <CardBody>
              <VStack align="start">
                <HStack>
                  <Text fontWeight="bold">APOD</Text>
                  <Badge colorScheme="purple">NASA</Badge>
                </HStack>
                {summary.apod.payload?.url && (
                  <Image
                    src={summary.apod.payload.url}
                    alt={summary.apod.payload.title}
                    maxH="100px"
                    borderRadius="md"
                  />
                )}
                <Text fontSize="sm" noOfLines={2}>
                  {summary.apod.payload?.title || "Нет данных"}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline">
            <CardBody>
              <Stat>
                <StatLabel>Близкие астероиды (NEO)</StatLabel>
                <StatNumber>
                  {summary.neo.payload?.element_count ?? 0}
                </StatNumber>
                <Text fontSize="sm">За последние 3 дня</Text>
              </Stat>
            </CardBody>
          </Card>

          <Card variant="outline">
            <CardBody>
              <VStack align="start">
                <Text fontWeight="bold">Солнечная активность</Text>
                <HStack>
                  <Badge colorScheme="orange">
                    Вспышки:{" "}
                    {Array.isArray(summary.flr.payload)
                      ? summary.flr.payload.length
                      : 0}
                  </Badge>
                  <Badge colorScheme="red">
                    CME:{" "}
                    {Array.isArray(summary.cme.payload)
                      ? summary.cme.payload.length
                      : 0}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline">
            <CardBody>
              <VStack align="start">
                <HStack>
                  <Text fontWeight="bold">SpaceX</Text>
                  <Badge colorScheme="gray">Next Launch</Badge>
                </HStack>
                <Text fontSize="sm">
                  {summary.spacex.payload?.name || "Нет данных о запуске"}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <HStack
          justify="space-between"
          mt={4}
          pt={4}
          borderTop="1px"
          borderColor="gray.200"
        >
          <Text fontSize="sm" color="gray.600">
            OSDR наборов: {summary.osdr_count}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Обновлено: {new Date().toLocaleTimeString("ru-RU")}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  );
};
