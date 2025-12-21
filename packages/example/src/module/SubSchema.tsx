import { createToken, useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import z from 'zod';
import { pubZodSchema, subZodSchema, subZodSchemaResult } from '@/utils/event';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { type ChatItemProps, chatMap } from '../components/chat/utils';
import { objectKeys, safetyParse, safetyPrint } from '../utils';

const SubSchema: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(subZodSchema, {
    callback: (record) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(record.detail),
          time: new Date(),
          type: 'receive',
        })
      ),
  });

  useEventChat(subZodSchemaResult, {
    schema: z.object({
      id: z.string(),
      type: z.enum(objectKeys(chatMap)),
    }),
    callback: (record) => {
      const { id, type } = record.detail;
      const index = list.findIndex((item) => item.id === id);
      const result = [...list];
      if (index > -1) {
        result.splice(index, 1, { ...result[index], type });
        setList(result);
      }
    },
  });

  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        const id = createToken('sub-schema');
        const data = safetyParse(detail);

        emit({
          detail: { ...(data ?? { data: detail }), id },
          name: pubZodSchema,
        });

        setList((current) =>
          current.concat({
            content: detail,
            time: new Date(),
            type: 'waiting',
            id,
          })
        );
      }}
    >
      <ChatList list={list} rollRef={rollRef} />
    </ChatPanel>
  );
};

export default SubSchema;
