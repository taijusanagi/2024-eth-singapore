import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};
