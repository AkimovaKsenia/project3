import { VStack, Heading } from "@chakra-ui/react";
import { ISSCard } from "../components/ISSCard";
import Layout from "../components/layout/Layout";
const ISSPage = () => {
  console.log("Rendering Space component");
  return (
    <Layout>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">МКС — орбитальные данные</Heading>
        <ISSCard />
      </VStack>
    </Layout>
  );
};

export default ISSPage;
