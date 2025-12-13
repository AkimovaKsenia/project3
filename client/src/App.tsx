import { Box, Container, VStack, Heading } from "@chakra-ui/react";
import { ISSCard } from "./components/ISSCard";
import "./App.css";
import Layout from "./components/layout/Layout";

function App() {
  console.log("Rendering Home component");
  return (
    <Layout>
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="6xl">
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={6}>
              <Box
                as="h1"
                fontSize="4xl"
                fontWeight="bold"
                color="blue.600"
                mb={5}
              >
                🚀 Space Dashboard
              </Box>
              <Box as="h2" fontSize="lg" color="gray.600">
                Мониторинг космических данных в реальном времени
              </Box>
            </Box>

            <Heading size="lg">МКС — орбитальные данные</Heading>
            <ISSCard />
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
}

export default App;
