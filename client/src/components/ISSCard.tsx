import React from "react";
import {
  Box,
  Card,
  CardBody,
  Stack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  HStack,
  VStack,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { createIcon } from "@chakra-ui/react";
import { useLastISS, useISSTrend, useRefreshData } from "../hooks/useSpaceData";

export const RefreshIcon = createIcon({
  displayName: "RefreshIcon",
  viewBox: "0 0 24 24",
  path: (
    <path
      fill="currentColor"
      d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1l-4 4 4 4V5c3.31 0 6 2.69 6 6 0 1.61-.62 3.08-1.64 4.16l1.43 1.43C18.41 14.27 19 12.22 19 10c0-2.21-.9-4.21-2.35-5.65z"
    />
  ),
});

export const ISSCard: React.FC = () => {
  const { data: issData, isLoading: issLoading } = useLastISS();
  const { data: trend, isLoading: trendLoading } = useISSTrend();
  const refresh = useRefreshData();

  const handleRefresh = () => {
    refresh.mutate(["iss"]);
  };

  if (!issData || !trend) {
    return <div>Нет данных</div>;
  }
  return (
    <Card>
      <CardBody>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            МКС — Международная космическая станция
          </Text>
          <IconButton
            aria-label="Обновить"
            icon={<RefreshIcon />}
            isLoading={refresh.isPending}
            onClick={handleRefresh}
            size="sm"
          />
        </HStack>

        <Stack spacing={4}>
          {issData?.payload && (
            <HStack spacing={6}>
              <Stat>
                <StatLabel>Широта</StatLabel>
                <StatNumber>
                  {issData?.payload?.latitude != null
                    ? issData.payload?.latitude.toFixed(4)
                    : "—"}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Долгота</StatLabel>
                <StatNumber>
                  {issData?.payload?.longitude != null
                    ? issData.payload?.longitude.toFixed(4)
                    : "—"}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Высота (км)</StatLabel>
                <StatNumber>
                  {issData?.payload?.altitude != null
                    ? issData.payload?.altitude.toFixed(1)
                    : "—"}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Скорость (км/ч)</StatLabel>
                <StatNumber>
                  {issData?.payload?.velocity != null
                    ? issData.payload?.velocity.toFixed(0)
                    : "—"}
                </StatNumber>
              </Stat>
            </HStack>
          )}

          {trend && (
            <Box>
              <HStack mb={2}>
                <Text fontWeight="medium">Тренд движения:</Text>
                <Badge colorScheme={trend.movement ? "green" : "gray"}>
                  {trend.movement ? "ДВИЖЕТСЯ" : "СТОИТ"}
                </Badge>
              </HStack>

              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm">
                    Смещение:{" "}
                    {trend.delta_km != null ? trend.delta_km.toFixed(3) : "—"}{" "}
                    км
                  </Text>
                  <Text fontSize="sm">
                    За: {trend.dt_sec != null ? trend.dt_sec.toFixed(1) : "—"}{" "}
                    сек
                  </Text>
                </HStack>

                {trend.velocity_kmh != null && (
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">
                        Скорость:{" "}
                        {trend.velocity_kmh != null
                          ? trend.velocity_kmh.toFixed(0)
                          : "—"}{" "}
                        км/ч
                      </Text>
                      <Text fontSize="sm">
                        {trend.velocity_kmh != null
                          ? (trend.velocity_kmh / 3.6).toFixed(1)
                          : "—"}{" "}
                        м/с
                      </Text>
                    </HStack>
                    <Progress
                      value={Math.min(trend.velocity_kmh / 30, 100)}
                      size="sm"
                    />
                  </Box>
                )}
              </VStack>
            </Box>
          )}

          {(issLoading || trendLoading) && (
            <Progress size="xs" isIndeterminate />
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
