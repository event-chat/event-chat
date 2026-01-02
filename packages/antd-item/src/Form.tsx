import { useEventChat } from '@event-chat/core';
import { FC, PropsWithChildren } from 'react';

const Form: FC<PropsWithChildren> = ({ children }) => {
  useEventChat('form-edit');
  return <form>{children}</form>;
};

export default Form;
