import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox,
} from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import type { Lists } from '.keystone/types';

export const lists: Lists = {
  Reservation: list({
    access: allowAll,
    fields: {
      guest: relationship({ ref: 'User', many: false }),
      status: select({
        type: 'enum',
        options: [{
          label: 'Canceled',
          value: 'Canceled',
        }, {
          label: 'Proceeding',
          value: 'Proceeding',
        }, {
          label: 'Confirmed',
          value: 'Confirmed',
        }, {
          label: 'Completed',
          value: 'Completed',
        }, ],
        defaultValue: 'Proceeding',
      }),
      restaurant: relationship({ ref: 'Restaurant', many: false }),
      table: relationship({ ref: 'Table', many: false }),
      expectedTime: timestamp({
        defaultValue: { kind: 'now' },
        validation: { isRequired: true },
      }),
      remark: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
    },
  }),
  Table: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      restaurant: relationship({ ref: 'Restaurant', many: false }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
    }
  }),
  Restaurant: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      staffs: relationship({
        ref: 'User.restaurants',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },
        many: true,
      }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      updatedAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    }
  }),
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      phone: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      password: password({ validation: { isRequired: true } }),
      isStaff: checkbox(),
      posts: relationship({ ref: 'Post.author', many: true }),
      restaurants: relationship({ ref: 'Restaurant.staffs', many: true }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),

  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      author: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },
        many: false,
      }),
      tags: relationship({
        ref: 'Tag.posts',
        many: true,
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
    },
  }),
  Tag: list({
    access: allowAll,
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
};
