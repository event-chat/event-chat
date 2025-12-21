import { useEventChat } from '@event-chat/core';
import { type FC, useRef, useState } from 'react';
import { z } from 'zod';
import { pubZodSchema, subNoLimit, subZodSchemaResult, toastOpen } from '@/utils/event';
import ChatList from '../components/chat/ChatList';
import ChatPanel from '../components/chat/ChatPanel';
import { type ChatItemProps } from '../components/chat/utils';
import { safetyPrint } from '../utils';

const PubSchema: FC = () => {
  const [list, setList] = useState<ChatItemProps[]>([]);
  const rollRef = useRef<HTMLDivElement>(null);

  const { emit } = useEventChat(pubZodSchema, {
    schema: z.object(
      {
        title: z.string({
          error: (issue) => (issue.input === undefined ? '请输入标题' : '标题类型不正确'),
        }),
        ingredients: z.array(z.string(), {
          error: (issue) =>
            issue.input === undefined ? '请输入原料' : '原料只能是多个字符组成的数组',
        }),
        description: z.string({ error: '描述类型不正确' }).optional(),
        id: z.string({ error: '编号类型不正确' }).optional(),
      },
      {
        error: '提交的格式和要求的不匹配',
      }
    ),
    callback: (record) =>
      setList((current) =>
        current.concat({
          content: safetyPrint(record.detail),
          time: new Date(),
          type: 'receive',
        })
      ),
    debug: (result) => {
      const { issues = [] } = result?.error ?? {};
      const { data } = result ?? {};
      const id: unknown = typeof data === 'object' && data ? Reflect.get(data, 'id') : undefined;

      if (issues.length > 0) {
        emit({
          detail: {
            message: '这条 toast 也是 event-chat 示例',
            title: issues[0].message,
            type: 'error',
          },
          name: toastOpen,
        });
      }

      if (id) {
        emit({ detail: { id: safetyPrint(id), type: 'faild' }, name: subZodSchemaResult });
      }
    },
  });

  return (
    <ChatPanel
      rollRef={rollRef}
      onChange={(detail) => {
        emit({ name: subNoLimit, detail });
        setList((current) =>
          current.concat({
            content: detail,
            time: new Date(),
            type: 'send',
          })
        );
      }}
    >
      <ChatList list={list} rollRef={rollRef} />
    </ChatPanel>
  );
};

export default PubSchema;
