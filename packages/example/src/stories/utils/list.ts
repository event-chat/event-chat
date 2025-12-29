import type { ReactNode } from 'react';

export const tagRange = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

export const getCatalogItemStyle = (tag: ListItemType['tag']) => {
  const styleMap = {
    h1: {
      indent: 'ml-0',
      fontSize: 'text-base',
      color: 'text-gray-800',
    },
    h2: {
      indent: 'ml-4',
      fontSize: 'text-base',
      color: 'text-gray-700',
    },
    h3: {
      indent: 'ml-8',
      fontSize: 'text-base',
      color: 'text-gray-700',
    },
    h4: {
      indent: 'ml-12',
      fontSize: 'text-sm',
      color: 'text-gray-600',
    },
    h5: {
      indent: 'ml-16',
      fontSize: 'text-xs',
      color: 'text-gray-600',
    },
    h6: {
      indent: 'ml-20',
      fontSize: 'text-xs',
      color: 'text-gray-500',
    },
  };

  return styleMap[tag];
};

export const isTagName = (name: string): name is ListItemType['tag'] =>
  tagRange.map(String).includes(name);

export interface CategoryListProps {
  list: ListItemType[];
  scrollTo?: (name: string) => void;
}

export type ListItemType = {
  name: string;
  tag: (typeof tagRange)[number];
  title: ReactNode;
};
