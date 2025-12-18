# 像聊天一样跨组建通信

- 提供一个自己的名字，和回调方法，`hooks` 会返回一个 `emit`
- 用 `emit` 可以向指定名称发送特定消息，在任意组件也可以提供事件名接收消息
- 无论是否是父子层级都能相互通信，不会引发不必要的 `rerender`

如下所示：

```typescript
const PubMox: FC = () => {
  const { emit } = useEventChat("pub-mox", {
    callback: (detail) => console.log("a----pub-mox", detail),
  });

  return (
    <button type="button" onClick={() => emit({ name: "sub-mox" })}>
      click it
    </button>
  );
};
```

```typescript
const SubMox: FC = () => {
  const { emit } = useEventChat("sub-mox", {
    callback: (detail) => console.log("a----sub-mox", detail),
  });

  return (
    <button type="button" onClick={() => emit({ name: "pub-mox" })}>
      click it
    </button>
  );
};
```

那如何确定收到的消息是当前组件需要的？我通过 `Zod` 来实现，提供一个 `schema` 后只有类型匹配的消息才会被接收。如下：

```typescript
const { token, emit } = useEventChat('pub-mox', {
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ingredients: z.array(z.string()),
  }),
  callback: (record) => console.log('a----pub-mox', record),
});
```

上方 `callback` 中拿到的参数类型如下：

```typescript
(parameter) record: DetailType<"pub-mox", z.ZodObject<{
  title: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  ingredients: z.ZodArray<z.ZodString>;
}, z.core.$strip>>

type DetailType<Name extends string = string, Schema extends ZodType = ZodType> = {
  __origin: string;
  name: Name;
  detail?: z.infer<Schema>;
};
```

