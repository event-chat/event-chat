import { useEventChat } from '@event-chat/core';
import type { FC } from 'react';
import { z } from 'zod';

const PubMox: FC = () => {
  // 新增：打印 Button 类型和内容
  const [emit] = useEventChat('pub-mox', {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      ingredients: z.array(z.string()),
    }),
    /* eslint-disable no-console */
    callback: ({ __origin, detail, name }) => console.log('a----pub-mox', name, __origin, detail),
  });

  return (
    <span>
      <button
        type="button"
        onClick={() => {
          emit({ name: 'sub-mox' });
        }}
      >
        click it
      </button>
    </span>
  );
};

export default PubMox;
