"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);
var import_core2 = require("@keystone-6/core");

// schema.ts
var import_core = require("@keystone-6/core");
var import_access = require("@keystone-6/core/access");
var import_lodash = require("lodash");
var import_dayjs = __toESM(require("dayjs"));
var import_fields = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
var lists = {
  Reservation: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      guest: (0, import_fields.relationship)({ ref: "User", many: false }),
      status: (0, import_fields.select)({
        type: "enum",
        options: [{
          label: "Canceled",
          value: "Canceled"
        }, {
          label: "Proceeding",
          value: "Proceeding"
        }, {
          label: "Confirmed",
          value: "Confirmed"
        }, {
          label: "Completed",
          value: "Completed"
        }],
        defaultValue: "Proceeding"
      }),
      restaurant: (0, import_fields.relationship)({ ref: "Restaurant", many: false }),
      table: (0, import_fields.relationship)({ ref: "Table", many: false }),
      expectedTime: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        validation: { isRequired: true }
      }),
      remark: (0, import_fields_document.document)({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1]
        ],
        links: true,
        dividers: true
      })
    }
  }),
  Table: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      restaurant: (0, import_fields.relationship)({ ref: "Restaurant", many: false }),
      content: (0, import_fields_document.document)({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1]
        ],
        links: true,
        dividers: true
      })
    }
  }),
  Restaurant: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      staffs: (0, import_fields.relationship)({
        ref: "User.restaurants",
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineConnect: true
        },
        many: true
      }),
      content: (0, import_fields_document.document)({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1]
        ],
        links: true,
        dividers: true
      }),
      logo: (0, import_fields.text)({
        hooks: {
          resolveInput: async ({ resolvedData, context }) => {
            if (resolvedData.logo) {
              return resolvedData.logo;
            }
            return "https://via.placeholder.com/150";
          },
          validateInput: async ({ resolvedData, addValidationError }) => {
            if (!resolvedData.logo) {
              addValidationError("Logo is required");
            }
          }
        }
      }),
      features: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.list(
            import_core.graphql.object()({
              name: "featureFields",
              fields: {
                name: import_core.graphql.field({ type: import_core.graphql.String }),
                enabled: import_core.graphql.field({ type: import_core.graphql.Boolean }),
                definedBy: import_core.graphql.field({ type: import_core.graphql.String })
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
                id: "desc"
              }],
              query: "enabled feature{name}"
            });
            let features = [];
            if (permenantFeatures.length) {
              permenantFeatures.forEach((permenantFeature) => {
                features.push({
                  name: permenantFeature.feature.name,
                  enabled: permenantFeature.enabled,
                  definedBy: "permenant"
                });
              });
              features = (0, import_lodash.uniqBy)(features, "name");
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
                      "lte": /* @__PURE__ */ new Date()
                    },
                    "endedAt": {
                      "gte": /* @__PURE__ */ new Date()
                    }
                  }
                }
              },
              orderBy: [{
                id: "asc"
              }],
              query: "enabled feature{name}"
            });
            if (scheduledFeatures.length) {
              scheduledFeatures.forEach((scheduledFeature) => {
                scheduledFeature.feature.forEach((feature) => {
                  features.push({
                    name: feature.name,
                    enabled: scheduledFeature.enabled,
                    definedBy: "schedule"
                  });
                });
              });
            }
            features.reverse();
            return (0, import_lodash.uniqBy)(features, "name");
          }
        }),
        ui: {
          query: "{ name enabled definedBy }",
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
          listView: { fieldMode: "hidden" }
        }
      })
    }
  }),
  User: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      phone: (0, import_fields.text)({ validation: { isRequired: true } }),
      email: (0, import_fields.text)({
        validation: { isRequired: true },
        isIndexed: "unique"
      }),
      password: (0, import_fields.password)({ validation: { isRequired: true } }),
      isStaff: (0, import_fields.checkbox)(),
      posts: (0, import_fields.relationship)({ ref: "Post.author", many: true }),
      restaurants: (0, import_fields.relationship)({ ref: "Restaurant.staffs", many: true }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" }
      })
    }
  }),
  Feature: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      description: (0, import_fields.text)()
    }
  }),
  FeatureToggle: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      feature: (0, import_fields.relationship)({ ref: "Feature", many: false }),
      enabled: (0, import_fields.checkbox)(),
      restaurant: (0, import_fields.relationship)({ ref: "Restaurant", many: true })
    }
  }),
  FeatureSchedule: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      restaurant: (0, import_fields.relationship)({ ref: "Restaurant", many: true }),
      feature: (0, import_fields.relationship)({ ref: "Feature", many: true }),
      schedule: (0, import_fields.relationship)({ ref: "ScheduleManager", many: true }),
      enabled: (0, import_fields.checkbox)()
    }
  }),
  ScheduleManager: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      description: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.String,
          async resolve(item, _, context) {
            let fullItem = item;
            if (!item.startedAt && !item.endedAt) {
              fullItem = await context.query.ScheduleManager.findOne({
                where: {
                  id: item.id
                },
                query: "id merger{id startedAt endedAt}"
              });
              return `Merger: ${fullItem.merger.map((item2) => `${item2.startedAt} - ${item2.endedAt}`).join(", ")}`;
            }
            return `Datetime: ${item.startedAt} - ${item.endedAt}`;
          }
        })
      }),
      startedAt: (0, import_fields.timestamp)({
        isIndexed: true
      }),
      endedAt: (0, import_fields.timestamp)({
        isIndexed: true
      }),
      cron: (0, import_fields.text)(),
      merger: (0, import_fields.relationship)({ ref: "ScheduleManager", many: true, ui: {
        labelField: "description",
        description: "Once the merger is selected, the startedAt and endedAt will be ignored, and only datetime items can be selected."
      } }),
      output: (0, import_fields.virtual)({
        field: import_core.graphql.field({
          type: import_core.graphql.list(
            import_core.graphql.object()({
              name: "outputFields",
              fields: {
                id: import_core.graphql.field({ type: import_core.graphql.String }),
                startedAt: import_core.graphql.field({ type: import_core.graphql.String }),
                endedAt: import_core.graphql.field({ type: import_core.graphql.String }),
                cron: import_core.graphql.field({ type: import_core.graphql.String })
              }
            })
          ),
          async resolve(item, _, context) {
            let fullItem = item;
            if (!item.startedAt && !item.endedAt) {
              fullItem = await context.query.ScheduleManager.findOne({
                where: {
                  id: item.id
                },
                query: "id merger{id startedAt endedAt cron}"
              });
              return fullItem.merger.map((mergerItem) => {
                return {
                  id: mergerItem.id,
                  startedAt: (0, import_dayjs.default)(mergerItem.startedAt).format("YYYY-MM-DD HH:mm:ss"),
                  endedAt: (0, import_dayjs.default)(mergerItem.endedAt).format("YYYY-MM-DD HH:mm:ss"),
                  cron: mergerItem.cron
                };
              });
            }
            return [{
              id: item.id,
              startedAt: (0, import_dayjs.default)(item.startedAt).format("YYYY-MM-DD HH:mm:ss"),
              endedAt: (0, import_dayjs.default)(item.endedAt).format("YYYY-MM-DD HH:mm:ss"),
              cron: item.cron
            }];
          }
        }),
        ui: {
          query: "{ startedAt endedAt cron }",
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
          listView: { fieldMode: "hidden" }
        }
      })
    },
    hooks: {
      validateInput: async ({ inputData, addValidationError, context }) => {
        if (inputData.merger) {
          const connectIds = inputData.merger.connect.map((item) => item.id);
          const mergerItems = await context.query.ScheduleManager.findMany({
            where: {
              id: {
                in: connectIds
              }
            },
            query: "id startedAt endedAt merger{id}"
          });
          mergerItems.forEach((item) => {
            if (item.merger.length) {
              addValidationError("Merger field should not have merger mode items");
            }
          });
        }
        if (!inputData.startedAt && !inputData.endedAt && !inputData.merger) {
          addValidationError("Time mode(startedAt and endedAt) or merger mode(Merger) should choose one");
        }
        if (inputData.startedAt && !inputData.endedAt) {
          addValidationError("EndedAt should not be empty");
        }
        if (inputData.startedAt && inputData.endedAt) {
          if ((0, import_dayjs.default)(inputData.startedAt).isAfter((0, import_dayjs.default)(inputData.endedAt))) {
            addValidationError("StartedAt should be less than EndedAt");
          }
        }
        if (inputData.merger && inputData.cron) {
          addValidationError("Merger is not empty, cron should be empty");
        }
        if (inputData.merger && inputData.merger.connect.length < 2) {
          addValidationError("Merger should be greater or equal to 2");
        }
      }
    },
    ui: {
      itemView: {
        defaultFieldMode: "read"
      }
    }
  }),
  Post: (0, import_core.list)({
    access: import_access.allowAll,
    fields: {
      title: (0, import_fields.text)({ validation: { isRequired: true } }),
      content: (0, import_fields_document.document)({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1]
        ],
        links: true,
        dividers: true
      }),
      author: (0, import_fields.relationship)({
        ref: "User.posts",
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineConnect: true
        },
        many: false
      }),
      tags: (0, import_fields.relationship)({
        ref: "Tag.posts",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] }
        }
      })
    }
  }),
  Tag: (0, import_core.list)({
    access: import_access.allowAll,
    ui: {
      isHidden: true
    },
    fields: {
      name: (0, import_fields.text)(),
      posts: (0, import_fields.relationship)({ ref: "Post.tags", many: true })
    }
  })
};

// auth.ts
var import_crypto = require("crypto");
var import_auth = require("@keystone-6/auth");
var import_session = require("@keystone-6/core/session");
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV !== "production") {
  sessionSecret = (0, import_crypto.randomBytes)(32).toString("hex");
}
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  // this is a GraphQL query fragment for fetching what data will be attached to a context.session
  //   this can be helpful for when you are writing your access control functions
  //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
  sessionData: "name createdAt",
  secretField: "password",
  // WARNING: remove initFirstItem functionality in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // if there are no items in the database, by configuring this field
    //   you are asking the Keystone AdminUI to create a new user
    //   providing inputs for these fields
    fields: ["name", "email", "password"]
    // it uses context.sudo() to do this, which bypasses any access control you might have
    //   you shouldn't use this in production
  }
});
var sessionMaxAge = 60 * 60 * 24 * 30;
var session = (0, import_session.statelessSessions)({
  maxAge: sessionMaxAge,
  secret: sessionSecret
});

// keystone.ts
var keystone_default = withAuth(
  (0, import_core2.config)({
    server: {
      cors: { origin: "*", credentials: true }
    },
    db: {
      provider: "sqlite",
      url: "file:./keystone.db"
    },
    lists,
    session
  })
);
//# sourceMappingURL=config.js.map
