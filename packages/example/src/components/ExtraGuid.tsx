import type { FC, PropsWithChildren, ReactNode } from 'react';

const ExtraGuid: FC<PropsWithChildren<ExtraGuidProps>> = ({ children, title = '提示：' }) => (
  <div className="">
    <div>{title}</div>
    <pre>{children}</pre>
  </div>
);

export default ExtraGuid;

interface ExtraGuidProps {
  title?: ReactNode;
}
