import { list, graphql } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import {uniqBy} from 'lodash';
import dayjs from 'dayjs';
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
            const permenantFeatures = await context.query.FeatureToggle.findMany({
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
            if (permenantFeatures.length) {
              permenantFeatures.forEach((permenantFeature) => {
                features.push({
                  name: permenantFeature.feature.name,
                  enabled: permenantFeature.enabled,
                  definedBy: 'permenant',
                })
              })
              features = uniqBy(features, 'name')
            }
            const scheduledFeatures = await context.query.FeatureSchedule.findMany({
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
            if (scheduledFeatures.length) {
              scheduledFeatures.forEach((scheduledFeature) => {
                scheduledFeature.feature.forEach((feature: { name: any; }) => {
                    features.push({
                        name: feature.name,
                        enabled: scheduledFeature.enabled,
                        definedBy: 'schedule',
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
      schedule: relationship({ ref: 'ScheduleManager', many: true }),
      enabled: checkbox(),
    }
  }),
  ScheduleManager: list({
    access: allowAll,
    fields: {
      description: virtual({
        field: graphql.field({
          type: graphql.String,
          async resolve(item, _, context) {
            let fullItem = item
            if (!item.startedAt && !item.endedAt) {
              fullItem = await context.query.ScheduleManager.findOne({
                where: {
                  id: item.id
                },
                query: 'id merger{id startedAt endedAt}'
              })
              return `Merger: ${fullItem.merger.map((item: { startedAt: any; endedAt: any; cron: string }) => `${item.startedAt} - ${item.endedAt}`).join(', ')}`
            }
            return `Datetime: ${item.startedAt} - ${item.endedAt}`;
          },
        }),
      }),
      startedAt: timestamp({
        isIndexed: true,
      }),
      endedAt: timestamp({
        isIndexed: true,
      }),
      cron: text(),
      merger: relationship({ ref: 'ScheduleManager', many: true, ui: {
          labelField: 'description',
          description: 'Once the merger is selected, the startedAt and endedAt will be ignored, and only datetime items can be selected.',
        } }),
      output: virtual({
        field: graphql.field({
          type: graphql.list(
              graphql.object<{
                startedAt: string
                endedAt: string
                cron: string
              }>()({
                name: 'outputFields',
                fields: {
                  startedAt: graphql.field({ type: graphql.String }),
                  endedAt: graphql.field({ type: graphql.String }),
                  cron: graphql.field({ type: graphql.String }),
                }
              })
          ),
          async resolve(item, _, context) {
            let fullItem = item
            if (!item.startedAt && !item.endedAt) {
              fullItem = await context.query.ScheduleManager.findOne({
                where: {
                  id: item.id
                },
                query: 'id merger{id startedAt endedAt cron}'
              })
              return fullItem.merger.map((item: { startedAt: any; endedAt: any; cron: string }) => {
                return {
                  startedAt: dayjs(item.startedAt).format('YYYY-MM-DD HH:mm:ss'),
                  endedAt: dayjs(item.endedAt).format('YYYY-MM-DD HH:mm:ss'),
                  cron: item.cron,
                }
              })
            }
            return [{
              startedAt: dayjs(item.startedAt).format('YYYY-MM-DD HH:mm:ss'),
              endedAt: dayjs(item.endedAt).format('YYYY-MM-DD HH:mm:ss'),
              cron: item.cron,
            }]
          }
        }),
        ui: {
          query: '{ startedAt endedAt cron }',
          createView: { fieldMode: 'hidden' },
          itemView: { fieldMode: 'read' },
          listView: { fieldMode: 'hidden' },
        }
      }),
    },
    hooks: {
      validateInput: async ({ inputData, addValidationError, context }) => {
        if (inputData.merger) {
          const connectIds = inputData.merger.connect.map((item: { id: any; }) => item.id)
          const mergerItems = await context.query.ScheduleManager.findMany({
            where: {
              id: {
                in: connectIds
              }
            },
            query: 'id startedAt endedAt merger{id}'
          })
          mergerItems.forEach((item: { startedAt: any; endedAt: any; merger: any; }) => {
            if (item.merger.length) {
              addValidationError('Merger field should not have merger mode items');
            }
          })
        }
        // check if startedAt and endedAt and merger is empty
        if (!inputData.startedAt && !inputData.endedAt && !inputData.merger) {
          addValidationError('Time mode(startedAt and endedAt) or merger mode(Merger) should choose one');
        }
        // check if startedAt is not empty, endedAt should not be empty
        if (inputData.startedAt && !inputData.endedAt) {
          addValidationError('EndedAt should not be empty');
        }
        // check if the startedAt is greater than endedAt
        if (inputData.startedAt && inputData.endedAt) {
          if (dayjs(inputData.startedAt).isAfter(dayjs(inputData.endedAt))) {
            addValidationError('StartedAt should be less than EndedAt');
          }
        }
        // check if the merger is not empty, cron should be empty
        if (inputData.merger && inputData.cron) {
          addValidationError('Merger is not empty, cron should be empty');
        }
        // check if the merger length is greater or equal to 2
        if (inputData.merger && inputData.merger.connect.length < 2) {
          addValidationError('Merger should be greater or equal to 2');
        }
      },
    },
    ui: {
      itemView: {
        defaultFieldMode: 'read',
      },
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
