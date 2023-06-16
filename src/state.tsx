import React, { useContext, useState } from "react";
import Parser from "web-tree-sitter";
import { Block } from "./lib/river";

export type Component = { block: Block; node: Parser.SyntaxNode };

const ComponentContext = React.createContext<{
  components: Component[];
  setComponents: (b: Component[]) => void;
}>({ components: [], setComponents: (_: Component[]) => { } });

// Component provider
export const ComponentProvider = ({ children }: React.PropsWithChildren) => {
  const [components, setComponents] = useState<Component[]>([]);
  // Remember to pass the state and the updater function to the provider
  return (
    <ComponentContext.Provider value={{ components, setComponents }}>
      {children}
    </ComponentContext.Provider>
  );
};

export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error(
      "useComponentContext must be used within the ComponentProvider"
    );
  }
  return context;
}
