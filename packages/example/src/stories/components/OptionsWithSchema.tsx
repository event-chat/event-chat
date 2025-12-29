import type { FC } from 'react';

const OptionsWithSchema: FC<OptionsWithSchemaProps> = (props) => {
  try {
    return <pre>{JSON.stringify(props)}</pre>;
  } catch {
    return <pre>null</pre>;
  }
};

export default OptionsWithSchema;

export interface OptionsWithSchemaProps {
  /**
   * Button contents
   */
  async?: boolean;
}
