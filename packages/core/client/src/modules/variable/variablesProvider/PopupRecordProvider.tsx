/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { FC } from 'react';
import { RecordProvider } from '../../../record-provider';
import { useCurrentPopupRecord } from './VariablePopupRecordProvider';

/**
 * Bridges CurrentPopupRecordContext to RecordContext/CollectionRecordProvider.
 * Use this to wrap FormBlockProvider and other blocks that need useRecord() in popup drawers
 * (Kanban card, Calendar event, Gantt task) when the drawer may render in a portal.
 */
export const PopupRecordProvider: FC<{ children?: React.ReactNode }> = React.memo(({ children }) => {
  const popupRecord = useCurrentPopupRecord();
  const record = popupRecord?.value;
  const collection = popupRecord?.collection;

  if (!record || !collection) {
    return <>{children}</>;
  }

  return (
    <RecordProvider record={record} collectionName={collection?.name}>
      {children}
    </RecordProvider>
  );
});

PopupRecordProvider.displayName = 'PopupRecordProvider';
