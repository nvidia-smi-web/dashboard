"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CustomElement } from './types';

interface CustomElementsProps {
  elements: CustomElement[];
}

const CustomElements: React.FC<CustomElementsProps> = ({ elements }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (!elements || elements.length === 0) {
    return null;
  }

  const renderElement = (element: CustomElement, index: number) => {
    switch (element.type) {
      case 'text':
        return (
          <p className="text-gray-700 dark:text-gray-300">{element.content}</p>
        );
      case 'link':
        return (
          <Link
            href={element.href}
            className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            target={element.target}
            rel={element.rel}
            download={element.download}
          >
            <span className="flex items-center whitespace-nowrap">
              {element.svgIcon && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={element.svgIcon} />
                </svg>
              )}
              {element.text}
            </span>
          </Link>
        );
      case 'copyable':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{element.label}</span>
            <button
              onClick={() => copyToClipboard(element.code, index)}
              className="flex items-center px-3 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              title="click to copy"
            >
              <code className="text-blue-600 font-mono">{element.code}</code>
              {copiedId === index ? (
                <span className="ml-2 text-green-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  copied!
                </span>
              ) : (
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 mb-8">
      {elements.map((element, index) => (
        <>
          <div key={element.id || index}>
            {renderElement(element, index)}
          </div>
          {element.breakAfter && <div key={`break-${element.id || index}`} className="w-full"></div>}
        </>
      ))}
    </div>
  );
};

export default CustomElements;
