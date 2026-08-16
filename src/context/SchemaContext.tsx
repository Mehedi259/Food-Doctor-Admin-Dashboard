import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from 'react';
import { getDynamicSchema } from '../api/services';

type SchemaContextType = {
  schema: any;
  loading: boolean;
};

const SchemaContext = createContext<SchemaContextType>({ schema: null, loading: true });

export const SchemaProvider = ({ children }: { children: ReactNode }) => {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const data = await getDynamicSchema();
        setSchema(data);
      } catch (error) {
        console.error('Failed to fetch dynamic schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  return (
    <SchemaContext.Provider value={{ schema, loading }}>
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = () => useContext(SchemaContext);
