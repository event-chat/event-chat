import { type FC, useCallback, useEffect, useState } from 'react';
import { type ListItemType, isTagName, tagRange } from '../utils/list';
import FloatingList from './FloatingList';
import HeadingList from './HeadingList';

const defaultWrapper = '#storybook-docs';
const defaultConfig = Object.freeze<MutationObserverInit>({
  attributes: false, // 监听元素变化，目前不需要
  attributeOldValue: false, // 监听元素属性旧值，目前不需要
  characterData: false, // 监听元素内容变化
  characterDataOldValue: false, // 是否记录内容变化的旧值
  childList: true, // 监听子元素添加
  subtree: true, // 监听子元素、孙元素、曾孙...
});

const ListObserver: FC<ListObserverProps> = ({ config, watch }) => {
  const [list, setList] = useState<ListItemType[]>([]);
  const scrollTo = useCallback((name: string) => {
    const targetElement = document.getElementById(name);
    if (targetElement) {
      targetElement.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
        inline: 'nearest',
      });
    }
  }, []);

  useEffect(() => {
    const target = watch?.();
    const targetNode = target === undefined ? document.querySelector(defaultWrapper) : target;

    const observer = new MutationObserver(() => {
      const nodeList = targetNode?.querySelectorAll(tagRange.join());
      const appendList: ListItemType[] = [];

      nodeList?.forEach((element) => {
        const id = element.nodeType === 1 ? element.id.trim() : '';
        const tag = element.tagName.toLowerCase();
        if (element instanceof HTMLElement && id && isTagName(tag)) {
          appendList.push({ name: id, title: element.innerText, tag });
          element.classList.add('category-item');
        }
      });

      const nodeRecord = appendList.map((item) => item.name);
      setList((current) => {
        const diff =
          nodeRecord.length !== current.length ||
          current.filter(({ name }) => !nodeRecord.includes(name)).length > 0;
        return diff ? appendList : current;
      });
    });

    if (targetNode) observer.observe(targetNode, config ?? defaultConfig);
    return () => {
      observer.disconnect();
      observer.takeRecords();
    };
  }, [config, setList, watch]);

  return (
    <>
      <HeadingList list={list} scrollTo={scrollTo} />
      <FloatingList list={list} scrollTo={scrollTo} />
    </>
  );
};

export default ListObserver;

interface ListObserverProps {
  config?: MutationObserverInit;
  watch?: () => HTMLElement | null;
}
