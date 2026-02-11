import type { FC, ReactNode } from 'react'
import Table, { TBody, Td, Th, Thead, Tr } from '@/components/Table'
import Tag from './Tag'

const TableList: FC<TableListProps> = ({ data }) => (
  <Table className={{ wrap: 'sb-unstyled' }}>
    <Thead>
      <Tr>
        <Th className="w-50 bg-gray-100" sticky>
          参数/属性
        </Th>
        <Th>说明</Th>
        <Th>类型</Th>
      </Tr>
    </Thead>
    <TBody>
      {data.map(({ desc, keyname, type }) => (
        <Tr className="hover:bg-gray-50" key={keyname}>
          <Td className="w-50 bg-white" sticky>
            {keyname}
          </Td>
          <Td className="border-r border-b border-gray-200 px-4 py-3 text-gray-600">
            {desc === undefined || desc === '' ? '--' : desc}
          </Td>
          <Td className="border-b border-gray-200 px-4 py-3 text-gray-600">
            <div className="inline-flex flex-col items-start gap-1">
              {type?.map((typeItem) => (typeItem ? <Tag key={typeItem}>{typeItem}</Tag> : null)) ??
                '--'}
            </div>
          </Td>
        </Tr>
      ))}
    </TBody>
  </Table>
)

export default TableList

interface TableListProps {
  data: DataItemType[]
}

type DataItemType = {
  keyname: string
  desc?: ReactNode
  type?: string[]
}
