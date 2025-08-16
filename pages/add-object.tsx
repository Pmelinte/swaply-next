// pages/add-object.tsx
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/add",
      permanent: false, // păstrează 302 (nu cache pe termen lung)
    },
  };
};

export default function AddObjectRedirect() {
  return null; // nu randăm nimic, e doar redirect server-side
}
