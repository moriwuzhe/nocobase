/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { SchemaInitializerItem, useSchemaInitializer, useCollection } from '@nocobase/client';
import { MessageOutlined } from '@ant-design/icons';

/**
 * Schema initializer item that adds a CommentBlock to a page.
 * Appears in the block initializer list when editing record detail pages.
 */
export const CommentBlockInitializer: React.FC = () => {
  const collection = useCollection();
  const { insert } = useSchemaInitializer();

  const handleClick = () => {
    insert({
      type: 'void',
      'x-component': 'CardItem',
      'x-component-props': {
        title: 'Comments',
      },
      properties: {
        comments: {
          type: 'void',
          'x-component': 'CommentBlock',
          'x-component-props': {
            collectionName: collection?.name,
          },
        },
      },
    });
  };

  return (
    <SchemaInitializerItem
      icon={<MessageOutlined />}
      title="Comments"
      onClick={handleClick}
    />
  );
};
