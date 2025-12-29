import type { FC } from 'react';
import BasicPrint from './BasicPrint';

const OptionsWithoutSchema: FC<OptionsWithoutSchemaProps> = (props) => <BasicPrint {...props} />;

export default OptionsWithoutSchema;

export interface OptionsWithoutSchemaProps {
  /**
   * Button contents
   */
  async?: boolean;
}
