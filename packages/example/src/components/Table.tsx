import { type FC, type PropsWithChildren, createContext, memo, useContext } from 'react';
import { cn, tv } from 'tailwind-variants';

const borderStyle = 'border-r border-b border-gray-200 last:border-r-0';
const stickyStyle = 'sticky left-0 z-10';

const tableStyles = tv({
  slots: {
    table: 'w-full border-separate border-spacing-0 text-sm',
    tbody: '',
    td: 'text-gray-800',
    th: 'font-semibold text-gray-700',
    thead: 'bg-gray-100',
    tr: '',
    wrap: 'w-full overflow-x-auto rounded-tl-sm rounded-tr-sm border-t border-r border-l border-gray-200',
  },
  variants: {
    align: {
      left: '',
      right: '',
    },
    border: {
      true: '',
    },
    sticky: {
      true: '',
    },
  },
  compoundSlots: [
    {
      slots: ['td', 'th'],
      className: 'px-4 py-3',
    },
    {
      slots: ['td', 'th'],
      align: 'left',
      class: 'text-left',
    },
    {
      slots: ['td', 'th'],
      align: 'right',
      class: 'text-right',
    },
    {
      slots: ['td', 'th'],
      border: true,
      class: borderStyle,
    },
    {
      slots: ['td', 'th'],
      sticky: true,
      class: stickyStyle,
    },
  ],
});

const TableContext = createContext({
  style: tableStyles(),
});

const Table: FC<PropsWithChildren<TableProps>> = ({
  children,
  className,
  align = 'left',
  border = true,
}) => {
  const style = tableStyles({ align, border });
  const { table, wrap } = className ?? {};
  return (
    <TableContext.Provider value={{ style }}>
      <div className={cn([style.wrap({ class: wrap }), className])}>
        <table className={style.table({ class: table })}>{children}</table>
      </div>
    </TableContext.Provider>
  );
};

const TBody: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { style } = useContext(TableContext);
  return <tbody className={cn([style.tbody(), className])}>{children}</tbody>;
};

const Td: FC<PropsWithChildren<TableCellProps>> = ({ children, className, sticky }) => {
  const { style } = useContext(TableContext);
  return <td className={cn([style.td({ sticky }), className])}>{children}</td>;
};

const Th: FC<PropsWithChildren<TableCellProps>> = ({ children, className, sticky }) => {
  const { style } = useContext(TableContext);
  return <th className={cn([style.th({ sticky }), className])}>{children}</th>;
};

const Thead: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { style } = useContext(TableContext);
  return <thead className={cn([style.thead(), className])}>{children}</thead>;
};

const Tr: FC<PropsWithChildren<TableBaseProps>> = ({ children, className }) => {
  const { style } = useContext(TableContext);
  return <tr className={cn([style.tr(), className])}>{children}</tr>;
};

export { TBody, Td, Th, Thead, Tr };

export default memo(Table);

interface TableBaseProps {
  className?: string;
}

interface TableProps {
  align?: 'left' | 'right';
  border?: boolean;
  className?: Partial<Record<'table' | 'wrap', string>>;
}

interface TableCellProps extends TableBaseProps {
  sticky?: boolean;
}
