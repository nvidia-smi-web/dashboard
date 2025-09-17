"use client";
import React, { useEffect, useState } from 'react';
import { Progress, Collapse } from 'antd';
import { Line } from '@ant-design/charts';
import { env } from 'next-runtime-env';
import type { GPUInfoType } from './types';

interface PerGPUProps {
  title: string;
  data: GPUInfoType;
  internal_time?: number;
}

const PROGRESS_COLORS = {
  NORMAL: '#00A0FF',
  WARNING: '#FFB000',
  DANGER: '#FF7030'
};

const TEMPERATURE_THRESHOLDS = {
  WARNING: 60,
  DANGER: 80
};

const CHART_DATA_LENGTH = env('NEXT_PUBLIC_CHART_DATA_LENGTH') ? parseInt(env('NEXT_PUBLIC_CHART_DATA_LENGTH')!, 10) : 200;

const getProgressColor = (percent: number) => {
  if (percent >= 90) return PROGRESS_COLORS.DANGER;
  if (percent >= 70) return PROGRESS_COLORS.WARNING;
  return PROGRESS_COLORS.NORMAL;
};

const getTemperatureColor = (temperature: number) => {
  if (temperature >= TEMPERATURE_THRESHOLDS.DANGER) return PROGRESS_COLORS.DANGER;
  if (temperature >= TEMPERATURE_THRESHOLDS.WARNING) return PROGRESS_COLORS.WARNING;
  return PROGRESS_COLORS.NORMAL;
};

const renderProgress = (percent: number) => (
  <Progress
    percent={percent}
    percentPosition={{ align: 'start', type: 'outer' }}
    strokeLinecap="butt"
    success={{ strokeColor: getProgressColor(percent) }}
    size={{ height: 15 }}
    strokeColor={getProgressColor(percent)}
    format={(percent) => (
      <span className="text-black dark:text-white">
        {`${percent}%`}
      </span>
    )}
  />
);

const renderInfo = (data: GPUInfoType) => (
  <div>
    <div className="mb-2">
      <div className="font-medium">GPU{data.idx} - {data.name}</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-x-3">
        <div className="whitespace-nowrap">Memory:</div>
        <div className="flex-1">{renderProgress(data.memory_utilization)}</div>
        <div className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          {data.memory_used_human}/{data.memory_total_human}
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <div className="whitespace-nowrap">Utilization:</div>
        <div className="flex-1">{renderProgress(data.gpu_utilization)}</div>
        <div className="whitespace-nowrap text-sm">
          <span style={{ color: getTemperatureColor(data.temperature) }}>
            {data.temperature}°C
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default function PerGPU({ title, data, internal_time = 1000 }: PerGPUProps) {
  const gpuid = `${title}-GPU${data.idx}`;
  const [activeKey, setActiveKey] = useState<string[]>(['0']);
  const [gpuUtilList, setGpuUtilList] = useState<number[]>(Array(CHART_DATA_LENGTH).fill(0));
  const [memoryUtilList, setMemoryUtilList] = useState<number[]>(Array(CHART_DATA_LENGTH).fill(0));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key.trim() === gpuid) {
        setActiveKey(value === 'true' ? ['0'] : ['1']);
        break;
      }
    }
  }, [gpuid]);

  useEffect(() => {
    if (data?.gpu_utilization !== undefined) {
      setGpuUtilList(prev => {
        const next = [...prev, data.gpu_utilization];
        if (next.length > CHART_DATA_LENGTH) next.shift();
        return next;
      });
    }
    if (data?.memory_utilization !== undefined) {
      setMemoryUtilList(prev => {
        const next = [...prev, data.memory_utilization];
        if (next.length > CHART_DATA_LENGTH) next.shift();
        return next;
      });
    }
  }, [data]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setCookie = (value: boolean) => {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `${gpuid}=${value}; expires=${date.toUTCString()}`;
  };

  const handleCollapseChange = (key: string | string[]) => {
    const isExpanded = Array.isArray(key) && key.length > 0;
    setCookie(!isExpanded);
    setActiveKey(Array.isArray(key) ? key : [key]);
  };

  const chartConfig = {
    data: [
      ...gpuUtilList.map((v, i) => ({
        time: `${((CHART_DATA_LENGTH - i) * internal_time / 1000).toString()}s`,
        value: v,
        type: 'Utilization'
      })),
      ...memoryUtilList.map((v, i) => ({
        time: `${((CHART_DATA_LENGTH - i) * internal_time / 1000).toString()}s`,
        value: v,
        type: 'Memory'
      }))
    ],
    xField: 'time',
    yField: 'value',
    colorField: 'type',
    height: 200,
    seriesField: 'type',
    shapeField: 'smooth',
    autoFit: true,
    animate: false,
    theme: isDarkMode ? 'classicDark' : 'classic',
    scale: {
      y: {
        type: 'linear',
        domain: [0, 100],
      }
    },
    tooltip: {
      items: [{ channel: 'y', valueFormatter: (value: number) => `${value}%` }],
    }
  };

  return (
    <div className="w-full">
      <Collapse
        activeKey={activeKey}
        onChange={handleCollapseChange}
        className="mt-2"
        items={[{
          key: '1',
          label: renderInfo(data),
          children: <Line {...chartConfig} />
        }]}
        size="small"
      />
    </div>
  );
}
