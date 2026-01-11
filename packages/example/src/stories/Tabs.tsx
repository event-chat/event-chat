import { useEventChat } from '@event-chat/core';
import { type ComponentProps, type FC, useState } from 'react';
import Tabs, { TabItem } from '@/components/Tabs';
import { tabItem } from '@/utils/event';
import { safetyPrint } from '@/utils/fields';

export const TabContent: FC<TabContentProps> = ({ active, defaultActive, group }) => {
  const [current, setCurrent] = useState(active ?? defaultActive);
  useEventChat(tabItem, {
    callback: ({ detail }) => setCurrent(safetyPrint(detail)),
    group,
  });

  return (
    <div className="animate-fade-in-up flex justify-center w-full">{safetyPrint(current)}</div>
  );
};

export { TabItem };

export default Tabs;

interface TabContentProps extends Pick<
  ComponentProps<typeof Tabs>,
  'active' | 'defaultActive' | 'group'
> {}
