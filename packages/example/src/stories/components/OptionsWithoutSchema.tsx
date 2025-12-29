import type { FC } from 'react';

const OptionsWithoutSchema: FC<OptionsWithoutSchemaProps> = (props) => {
  try {
    return <pre>{JSON.stringify(props)}</pre>;
  } catch {
    return <pre>null</pre>;
  }
};

export default OptionsWithoutSchema;

export interface OptionsWithoutSchemaProps {
  /**
   * Button contents
   */
  async?: boolean;
}
