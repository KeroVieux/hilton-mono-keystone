import { list, graphql } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import {uniqBy} from 'lodash';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox, virtual,
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
      logo: text({
        hooks: {
          resolveInput: async ({ resolvedData, context }) => {
            if (resolvedData.logo) {
              return resolvedData.logo;
            }
            return 'https://via.placeholder.com/150';
          },
          validateInput: async ({ resolvedData, addValidationError }) => {
            if (!resolvedData.logo) {
              addValidationError('Logo is required');
            }
          }
        }
      }),
      features: virtual({
        field: graphql.field({
          type: graphql.list(
              graphql.object<{
                name: string
                enabled: boolean
                definedBy: string
              }>()({
                name: 'featureFields',
                fields: {
                  name: graphql.field({ type: graphql.String }),
                  enabled: graphql.field({ type: graphql.Boolean }),
                  definedBy: graphql.field({ type: graphql.String }),
                }
              })
          ),
          async resolve(item, _, context, info) {
            const permenantFeatureToggles = await context.query.FeatureToggle.findMany({
                where: {
                  "restaurant": {
                    "some": {
                      "id": {
                        "equals": item.id
                      }
                    }
                  }
                },
              orderBy: [{
                id: 'desc',
              }],
              query: 'enabled feature{name}',
            })
            let features: any[] = []
            if (permenantFeatureToggles.length) {
              permenantFeatureToggles.forEach((featureToggle) => {
                features.push({
                  name: featureToggle.feature.name,
                  enabled: featureToggle.enabled,
                  definedBy: 'permenant',
                })
              })
              features = uniqBy(features, 'name')
            }
            const featureSchedules = await context.query.FeatureSchedule.findMany({
              where: {
                "restaurant": {
                  "some": {
                    "id": {
                      "equals": item.id
                    }
                  }
                },
                "schedule": {
                  "some": {
                    "startedAt": {
                      "lte": new Date()
                    },
                    "endedAt": {
                      "gte": new Date()
                    }
                  }
                  },
              },
              orderBy: [{
                id: 'asc',
              }],
              query: 'enabled feature{name}',
            })
            if (featureSchedules.length) {
              featureSchedules.forEach((schedule) => {
                schedule.feature.forEach((feature: { name: any; }) => {
                    features.push({
                        name: feature.name,
                        enabled: schedule.enabled,
                        definedBy: 'scheduled',
                    })
                })
              })
            }
            features.reverse()
            return uniqBy(features, 'name')
          }
        }),
        ui: {
            query: '{ name enabled definedBy }',
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
            listView: { fieldMode: 'hidden' },
        }
      }),
    },
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
  Feature: list({
    access: allowAll,
    fields: {
        name: text({ validation: { isRequired: true } }),
        description: text(),
    }
  }),
  FeatureToggle: list({
    access: allowAll,
    fields: {
        feature: relationship({ ref: 'Feature', many: false }),
        enabled: checkbox(),
        restaurant: relationship({ ref: 'Restaurant', many: true }),
    }
  }),
  FeatureSchedule: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      restaurant: relationship({ ref: 'Restaurant', many: true }),
      feature: relationship({ ref: 'Feature', many: true }),
      schedule: relationship({ ref: 'Schedule', many: true }),
      enabled: checkbox(),
    }
  }),
  Schedule: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      startedAt: timestamp({
        defaultValue: { kind: 'now' },
        isIndexed: true,
      }),
      endedAt: timestamp({
        isIndexed: true,
      }),
    }
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
