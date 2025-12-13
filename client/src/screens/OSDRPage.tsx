import { Heading } from "@chakra-ui/react";
import { OSDRList } from "../components/OSDRList";
import Layout from "../components/layout/Layout";

const OSDRPage = () => {
  return (
    <Layout>
      <Heading size="lg" mb={6}>
        OSDR datasets
      </Heading>
      <OSDRList />
    </Layout>
  );
};

export default OSDRPage;
