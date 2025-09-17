"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
import { env } from 'next-runtime-env';
import PerServer from "./components/perServer";
import CustomElements from "./components/customElements";
import { CustomElement } from "./components/types";

export default function Home() {
  const [pageReady, setPageReady] = useState(false);
  const title = env('NEXT_PUBLIC_SITE_TITLE') || 'GPU Dashboard';
  const NO_NEED_LOGIN = env('NEXT_PUBLIC_NO_NEED_LOGIN') === 'true';
  const SERVERS_ID = (env('NEXT_PUBLIC_SERVERS_ID') || '').split(',');
  const CUSTOM_ELEMENTS = env('NEXT_PUBLIC_CUSTOM_ELEMENTS');
  const [customElements, setCustomElements] = useState<CustomElement[]>([]);

  useEffect(() => {
    const access = async () => {
      try {
        if (!NO_NEED_LOGIN) {
          await fetch('/api/access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }
      } catch (error) {
        console.error('Failed to log access:', error);
      } finally {
        setPageReady(true);
      }
    };
    access();

    if (CUSTOM_ELEMENTS) {
      try {
        const elements = JSON.parse(CUSTOM_ELEMENTS);
        if (Array.isArray(elements)) {
          setCustomElements(elements);
        }
      } catch (error) {
        console.error('Failed to parse NEXT_PUBLIC_CUSTOM_ELEMENTS:', error);
      }
    }
  }, [NO_NEED_LOGIN, CUSTOM_ELEMENTS]);

  return (
    <>
      {!pageReady ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%'
        }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-5">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">{title}</h1>
          </div>

          {customElements.length > 0 && <CustomElements elements={customElements} />}

          <div className="grid gap-6">
            {SERVERS_ID.map((serverId) => (
              <PerServer key={serverId} serverId={serverId} title={serverId} internal_time={1000} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
