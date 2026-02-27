/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { createContext, useContext } from 'react';
import { useRequest } from '../api-client';

export const CurrentAppInfoContext = createContext(null);
CurrentAppInfoContext.displayName = 'CurrentAppInfoContext';

export const useCurrentAppInfo = () => {
  return useContext<{
    data: {
      database: {
        dialect: string;
      };
      lang: string;
      version: string;
      exportLimit?: number;
      name: string;
    };
  }>(CurrentAppInfoContext);
};
export const CurrentAppInfoProvider = (props) => {
  const result = useRequest(
    {
      url: 'app:getInfo',
    },
    {
      retryCount: 5,
      retryInterval: 2000,
      retryError: (err: any) => {
        const status = err?.response?.status;
        return status === 503 || status === 502 || status === 504 || status === 404;
      },
    },
  );

  return <CurrentAppInfoContext.Provider value={result.data}>{props.children}</CurrentAppInfoContext.Provider>;
};
