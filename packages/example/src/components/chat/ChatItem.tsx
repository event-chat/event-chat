import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { type ChatItemProps, chatMap } from './utils';

const iconMap = Object.freeze({
  faild: faCircleXmark,
  receive: faCircleCheck,
  send: faCircleCheck,
  waiting: faSpinner,
});

const ChatItem: FC<ChatItemProps> = ({ type, ...props }) => {
  const TimeCom = chatMap[type];
  return (
    <TimeCom
      {...props}
      footer={
        <FontAwesomeIcon
          className={type === 'waiting' ? 'animate-spin' : undefined}
          icon={iconMap[type]}
        />
      }
      type={type}
    />
  );
};

export default ChatItem;
