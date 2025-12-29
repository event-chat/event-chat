import type { FC } from 'react';

const BasicPrint: FC<Record<string, unknown>> = (props) => {
  try {
    return <pre>{JSON.stringify(props)}</pre>;
  } catch {
    return <pre>null</pre>;
  }
};

export default BasicPrint;
