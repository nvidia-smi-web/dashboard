import React from 'react';
import { Table, Popover } from 'antd';
import type { TableProps } from 'antd';
import type { ProcessesDataType } from './types';

interface ProcessesTableProps {
  data: ProcessesDataType[];
}

const COMMAND_DISPLAY_LIMIT = 100;

const columns: TableProps<ProcessesDataType>['columns'] = [
  {
    title: 'GPU',
    dataIndex: 'idx',
    key: 'idx',
    render: (idx) => `GPU${idx}`,
  },
  {
    title: 'PID',
    dataIndex: 'pid',
    key: 'pid',
  },
  {
    title: 'User',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'GPU Usage',
    dataIndex: 'gpu_memory',
    key: 'gpu_memory',
  },
  {
    title: 'Command',
    dataIndex: 'command',
    key: 'command',
    ellipsis: true,
    render: (text: string) => (
      <Popover
        content={
          <div style={{
            maxWidth: '500px',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }}>
            {text}
          </div>
        }
        placement="topLeft"
        arrow={false}
      >
        {text.length > COMMAND_DISPLAY_LIMIT
          ? `${text.slice(0, COMMAND_DISPLAY_LIMIT)}...`
          : text}
      </Popover>
    ),
  },
];

export default function ProcessesTable({ data }: ProcessesTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <Table<ProcessesDataType>
        columns={columns}
        dataSource={data.map((item, index) => ({
          ...item,
          key: index
        }))}
        size="small"
        pagination={false}
        tableLayout="auto"
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
