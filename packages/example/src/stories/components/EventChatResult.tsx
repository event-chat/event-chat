import type { FC } from 'react';
import BasicPrint from './BasicPrint';

const EventChatResult: FC<EventChatResultProps> = (props) => <BasicPrint {...props} />;

export default EventChatResult;

export interface EventChatResultProps {
  /**
   * 返回的密钥，用于私聊时 emiit 使用
   */
  token: string;
}
