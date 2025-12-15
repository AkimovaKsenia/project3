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
  Box,
  Skeleton,
} from "@chakra-ui/react";
import { useSpaceSummary } from "../hooks/useSpaceData";
import { useSpaceSummaryData } from "../hooks/useSpaceSummaryData";

export const SpaceDataCard: React.FC = () => {
  const { data: summary, isLoading } = useSpaceSummary();

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="20px" mb={4} />
          <SimpleGrid columns={2} spacing={4}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height="100px" />
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardBody>
          <Text>Не удалось загрузить данные</Text>
        </CardBody>
      </Card>
    );
  }

  const {
    apodTitle,
    apodUrl,
    apodThumbUrl,
    neoCount,
    flrCount,
    cmeCount,
    spacexName,
    spacexDate,
    issAltitude,
    issVelocity,
    osdrCount,
    updateTime,
  } = useSpaceSummaryData(summary);

  return (
    <Card>
      <CardBody>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Космическая сводка
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card variant="outline" bg="white">
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="bold">APOD</Text>
                  <Badge colorScheme="purple">NASA</Badge>
                </HStack>

                {apodUrl || apodThumbUrl ? (
                  <>
                    <Image
                      src={apodThumbUrl || apodUrl}
                      alt={apodTitle || "Astronomy Picture of the Day"}
                      maxH="80px"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/150x100/805ad5/ffffff?text=NASA+APOD"
                    />
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {apodTitle || "Astronomy Picture of the Day"}
                    </Text>
                  </>
                ) : (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      NASA Astronomy Picture of the Day
                    </Text>
                    <Badge colorScheme="yellow" fontSize="xs">
                      Данные временно недоступны
                    </Badge>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline" bg="white">
            <CardBody>
              <Stat>
                <StatLabel>Близкие астероиды (NEO)</StatLabel>
                <StatNumber fontSize="2xl">{neoCount}</StatNumber>
                <Text fontSize="sm" color="gray.600">
                  За последние 3 дня
                </Text>
                {neoCount === 0 && (
                  <Badge colorScheme="yellow" mt={2} fontSize="xs">
                    Обновление данных
                  </Badge>
                )}
              </Stat>
            </CardBody>
          </Card>

          <Card variant="outline" bg="white">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Солнечная активность</Text>
                <HStack spacing={3}>
                  <VStack align="center" spacing={1}>
                    <Badge colorScheme="orange" fontSize="md">
                      Вспышки
                    </Badge>
                    <Text fontSize="lg" fontWeight="bold">
                      {flrCount}
                    </Text>
                  </VStack>
                  <VStack align="center" spacing={1}>
                    <Badge colorScheme="red" fontSize="md">
                      CME
                    </Badge>
                    <Text fontSize="lg" fontWeight="bold">
                      {cmeCount}
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Солнечные события за 5 дней
                </Text>
                {flrCount === 0 && cmeCount === 0 && (
                  <Badge colorScheme="yellow" fontSize="xs">
                    Нет активных событий
                  </Badge>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card variant="outline" bg="white">
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontWeight="bold">SpaceX</Text>
                  <Badge colorScheme="gray">Next Launch</Badge>
                </HStack>
                <Text fontSize="md" fontWeight="medium">
                  {spacexName}
                </Text>
                {spacexDate && (
                  <Text fontSize="xs" color="gray.600">
                    {new Date(spacexDate).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                )}
                {spacexName === "Нет данных" && (
                  <Badge colorScheme="yellow" fontSize="xs">
                    Обновление данных
                  </Badge>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">
              МКС
            </Text>
            <Text fontSize="xs">
              Высота: {issAltitude.toFixed(1)} км
              <br />
              Скорость: {(issVelocity / 1000).toFixed(1)} км/с
            </Text>
          </Box>

          <Box p={3} bg="green.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">
              OSDR наборов
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {osdrCount}
            </Text>
            <Text fontSize="xs">Открытые научные данные NASA</Text>
          </Box>

          <Box p={3} bg="gray.100" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">
              Обновлено
            </Text>
            <Text fontSize="md">{updateTime}</Text>
          </Box>
        </SimpleGrid>

        <Box mt={4} p={3} bg="white" borderRadius="md" fontSize="xs">
          <Text fontWeight="medium">Примечание:</Text>
          <Text>
            Данные NASA (APOD, NEO, солнечная активность) могут быть временно
            недоступны из-за ограничений API. SpaceX и OSDR данные обновляются
            нормально.
          </Text>
        </Box>
      </CardBody>
    </Card>
  );
};
