"use client";
import React, { useEffect, useState } from 'react';
import { Collapse, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ProcessesTable from './processesTable';
import PerGPU from './perGPU';
import type { GPUInfoType, ServerType } from './types';

interface PerServerProps {
  serverId: string;
  title: string;
  internal_time?: number;
}

export default function PerServer({ serverId, title, internal_time = 1000 }: PerServerProps) {
  const [data, setData] = useState<ServerType | null>(null);
  const [activeKey, setActiveKey] = useState<string[]>(['0']);

  useEffect(() => {
    if (activeKey.length === 0) {
      return;
    }

    const fetchServerData = async () => {
      try {
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serverId }),
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch server data:', error);
      }
    };

    fetchServerData();

    const interval = setInterval(fetchServerData, internal_time);
    return () => clearInterval(interval);
  }, [serverId, internal_time, activeKey]);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key.trim() === title) {
        setActiveKey(value === 'true' ? [] : ['0']);
        break;
      }
    }
  }, [title]);

  const setCookie = (value: boolean) => {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `${title}=${value}; expires=${date.toUTCString()}`;
  };

  const handleCollapseChange = (key: string | string[]) => {
    const isCollapsed = Array.isArray(key) && key.length === 0;
    setCookie(isCollapsed);
    setActiveKey(Array.isArray(key) ? key : [key]);
  };

  const renderContent = () => {
    if (!data || data.code !== 0) {
      return <Spin indicator={<LoadingOutlined spin />} />;
    }

    return (
      <div className="space-y-2">
        {data.data.devices.map((gpu: GPUInfoType) => (
          <PerGPU title={title} key={gpu.idx} data={gpu} internal_time={internal_time} />
        ))}
        <ProcessesTable data={data.data.processes} />
      </div>
    );
  };

  return (
    <div className="container">
      <Collapse
        activeKey={activeKey}
        onChange={handleCollapseChange}
        items={[
          {
            key: '0',
            label: <h2 className="text-black dark:text-white text-center">{title}</h2>,
            children: renderContent()
          }
        ]}
      />
    </div>
  );
}
