import type { FC } from 'react'
import SchemaField from '../SchemaField'

const FaceSchema: FC = () => (
  <SchemaField>
    <SchemaField.Object name="user-map">
      <SchemaField.Void
        x-component="RecentChoices"
        x-component-props={{ eventName: 'select-user', hidden: true }}
        x-reactions={{
          dependencies: ['.section'],
          fulfill: {
            state: {
              data: '{{ $deps[0] ?? [] }}',
            },
          },
        }}
      />
      <SchemaField.Array name="section" />
    </SchemaField.Object>
  </SchemaField>
)

export default FaceSchema
