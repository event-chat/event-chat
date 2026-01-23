import { EventChatOptions, NamepathType, createToken, useEventChat } from '@event-chat/core';
import { ForwardedRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { ZodType } from 'zod';
import { FormInputInstance, useFormEvent } from './utils';

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
const convertPath = (path?: NamepathType) =>
  (typeof path === 'object' ? [...path] : [path]).filter(isDefined);

const InputInner = <Schema extends ZodType>(
  { name, callback, onChange, ...props }: FormInputProps<Schema>,
  ref?: ForwardedRef<FormInputInstance>
) => {
  const { group, parent } = useFormEvent();
  const fieldName = useMemo(() => {
    const itemName = convertPath(name);
    const namePaths = convertPath(parent).concat(itemName);
    return (
      (namePaths.length === 0 ? [createToken('input-name')] : undefined) ??
      (namePaths.length === 1 && typeof name !== 'object' ? (name ?? namePaths) : namePaths)
    );
  }, [name, parent]);

  const result = useEventChat(fieldName, {
    ...props,
    callback: (record) => {
      callback?.(record, result);
      onChange?.(record.detail, result);
    },
    group,
  });

  useImperativeHandle(ref, () => ({ emit: result.emit }), [result]);
  return null;
};

const FormInput = forwardRef(InputInner) as (<Schema extends ZodType>(
  props: FormInputProps<Schema> & { ref?: ForwardedRef<FormInputInstance> }
) => ReturnType<typeof InputInner>) & { displayName?: string };

if (process.env.NODE_ENV !== 'production') {
  FormInput.displayName = 'FormInput';
}

export default FormInput;

export interface FormInputProps<Schema extends ZodType> extends Omit<
  OptionsType<Schema>,
  'callback' | 'group'
> {
  name?: NamepathType;
  callback?: (
    target: Parameters<NonNullable<OptionsType<Schema>['callback']>>[0],
    options: ReturnType<typeof useEventChat>
  ) => void;
  onChange?: (
    value: Parameters<NonNullable<OptionsType<Schema>['callback']>>[0]['detail'],
    options: ReturnType<typeof useEventChat>
  ) => void;
}

type OptionsType<Schema extends ZodType> = EventChatOptions<
  NamepathType,
  Schema,
  string,
  string,
  undefined
>;
