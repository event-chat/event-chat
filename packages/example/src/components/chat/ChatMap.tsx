import type { FC } from 'react';
import type { ChatItemProps } from './utils';

const getTime = (datetime: Date) => datetime.toLocaleString().split(' ').pop();

export const Failed: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-rose-400 chat-container rounded-tr-none">
      <div className="chat-content text-white">{content}</div>
      <p className="chat-footer justify-end text-yellow-300">
        <span>faild</span>
        <span>{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-rose-400 chat-corner" />
    </div>
  </div>
);

export const Receive: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer, time }) => (
  <div className="chat-wrapper justify-start">
    <div className="bg-white chat-container rounded-tl-none">
      <div className="chat-content text-slate-800">{content}</div>
      <p className="chat-footer text-slate-400">
        <span className="text-green-500">{footer}</span>
        <span>{getTime(time)}</span>
      </p>
      <div className="-left-1 border-r-4 border-r-white chat-corner" />
    </div>
  </div>
);

export const Send: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer, time }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-blue-600 chat-container rounded-tr-none">
      <div className="chat-content text-white">{content}</div>
      <p className="chat-footer justify-end text-slate-400">
        <span>{getTime(time)}</span>
        <span className="text-blue-400">{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-blue-600 chat-corner" />
    </div>
  </div>
);

export const Waiting: FC<Omit<ChatItemProps, 'receive'>> = ({ content, footer }) => (
  <div className="chat-wrapper justify-end">
    <div className="bg-blue-600 chat-container rounded-tr-none">
      <div className="chat-content text-white">{content}</div>
      <p className="chat-footer justify-end text-slate-400">
        <span>waiting</span>
        <span className="text-blue-400">{footer}</span>
      </p>
      <div className="-right-1 border-l-4 border-l-blue-600 chat-corner" />
    </div>
  </div>
);
