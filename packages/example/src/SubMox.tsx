import { useEventChat } from '@event-chat/core';
import type { FC } from 'react';

const SubMox: FC = () => {
  const { emit } = useEventChat('sub-mox', {
    /* eslint-disable no-console */
    callback: (detail) => console.log('a----sub-mox', detail),
  });

  return (
    <button
      type="button"
      onClick={() => {
        emit({ name: 'pub-mox' });
      }}
    >
      click it
    </button>
  );
};

export default SubMox;
