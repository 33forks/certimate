package migrations

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/samber/lo"
)

func init() {
	m.Register(func(app core.App) error {
		tracer := NewTracer("v0.4.0")
		tracer.Printf("go ...")

		// update collection `settings`
		//   - delete records: 'notifyChannels', 'notifyTemplates'
		{
			collection, err := app.FindCollectionByNameOrId("dy6ccjb60spfy6p")
			if err != nil {
				return err
			} else if collection != nil {
				if _, err := app.DB().NewQuery("DELETE FROM settings WHERE name = 'notifyChannels'").Execute(); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("DELETE FROM settings WHERE name = 'notifyTemplates'").Execute(); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)
			}
		}

		// update collection `acme_accounts`
		//   - add field `acmeAcctUrl`
		//   - add field `acmeDirUrl`
		//   - rename field `key` to `privateKey`
		//   - rename field `resource` to `acmeAccount`
		//   - migrate field `acmeAccount`
		{
			collection, err := app.FindCollectionByNameOrId("012d7abbod1hwvr")
			if err != nil {
				return err
			}

			if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
					"exceptDomains": null,
					"hidden": false,
					"id": "url2424532088",
					"name": "acmeAcctUrl",
					"onlyDomains": null,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "url"
				}`)); err != nil {
				return err
			}

			if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
					"exceptDomains": null,
					"hidden": false,
					"id": "url3632694140",
					"name": "acmeDirUrl",
					"onlyDomains": null,
					"presentable": false,
					"required": false,
					"system": false,
					"type": "url"
				}`)); err != nil {
				return err
			}

			if err := collection.Fields.AddMarshaledJSONAt(3, []byte(`{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "genxqtii",
					"max": 0,
					"min": 0,
					"name": "privateKey",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				}`)); err != nil {
				return err
			}

			if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
					"hidden": false,
					"id": "1aoia909",
					"maxSize": 2000000,
					"name": "acmeAccount",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "json"
				}`)); err != nil {
				return err
			}

			if err := app.Save(collection); err != nil {
				return err
			}

			records, err := app.FindAllRecords(collection)
			if err != nil {
				return err
			}

			for _, record := range records {
				changed := false
				deleted := false

				resource := make(map[string]any)
				if err := record.UnmarshalJSONField("acmeAccount", &resource); err != nil {
					return err
				}

				if _, ok := resource["body"]; ok {
					record.Set("acmeAcctUrl", resource["uri"].(string))
					record.Set("acmeAccount", resource["body"].(map[string]any))
					changed = true
				}

				ca := record.GetString("ca")
				if strings.Contains(ca, "#") {
					record.Set("ca", strings.Split(ca, "#")[0])
					if access, err := app.FindRecordById("access", strings.Split(ca, "#")[1]); err != nil {
						deleted = true
					} else {
						switch access.GetString("provider") {
						case "buypass":
							record.Set("acmeDirUrl", "https://api.buypass.com/acme/directory")
							changed = true

						case "googletrustservices":
							record.Set("acmeDirUrl", "https://dv.acme-v02.api.pki.goog/directory")
							changed = true

						case "sslcom":
							record.Set("acmeDirUrl", "https://acme.ssl.com/sslcom-dv-rsa")
							changed = true

						case "zerossl":
							record.Set("acmeDirUrl", "https://acme.zerossl.com/v2/DV90")
							changed = true

						case "acmeca":
							accessConfig := make(map[string]any)
							access.UnmarshalJSONField("config", &accessConfig)
							record.Set("acmeDirUrl", accessConfig["endpoint"].(string))
							changed = true
						}
					}
				} else {
					switch ca {
					case "letsencrypt":
						record.Set("acmeDirUrl", "https://acme-v02.api.letsencrypt.org/directory")
						changed = true

					case "letsencryptstaging":
						record.Set("acmeDirUrl", "https://acme-staging-v02.api.letsencrypt.org/directory")
						changed = true
					}
				}

				if changed {
					if err := app.Save(record); err != nil {
						return err
					}

					tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
				}

				if deleted {
					if err := app.Delete(record); err != nil {
						return err
					}

					tracer.Printf("record #%s in collection '%s' deleted", record.Id, collection.Name)
				}
			}

			tracer.Printf("collection '%s' updated", collection.Name)
		}

		// update collection `access`
		//   - modify field `config` schema: rename property `defaultReceiver` to `receiver`
		//   - modify field `reserve` candidates
		//   - delete records: 'local'
		{
			collection, err := app.FindCollectionByNameOrId("4yzbv8urny5ja1e")
			if err != nil {
				return err
			} else if collection != nil {
				if _, err := app.DB().NewQuery("UPDATE access SET reserve = 'notif' WHERE reserve = 'notification'").Execute(); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("DELETE FROM access WHERE provider = 'local'").Execute(); err != nil {
					return err
				}

				records, err := app.FindAllRecords(collection)
				if err != nil {
					return err
				}

				for _, record := range records {
					changed := false

					provider := record.GetString("provider")
					config := make(map[string]any)
					if err := record.UnmarshalJSONField("config", &config); err != nil {
						return err
					}

					switch provider {
					case "discordbot", "mattermost", "slackbot":
						if _, ok := config["defaultChannelId"]; ok {
							config["channelId"] = config["defaultChannelId"]
							delete(config, "defaultChannelId")
							record.Set("config", config)
							changed = true
						}

					case "email":
						if _, ok := config["defaultSenderAddress"]; ok {
							config["senderAddress"] = config["defaultSenderAddress"]
							delete(config, "defaultSenderAddress")
							record.Set("config", config)
							changed = true
						}
						if _, ok := config["defaultSenderName"]; ok {
							config["senderName"] = config["defaultSenderName"]
							delete(config, "defaultSenderName")
							record.Set("config", config)
							changed = true
						}
						if _, ok := config["defaultReceiverAddress"]; ok {
							config["receiverAddress"] = config["defaultReceiverAddress"]
							delete(config, "defaultReceiverAddress")
							record.Set("config", config)
							changed = true
						}

					case "telegrambot":
						if _, ok := config["defaultChatId"]; ok {
							config["chatId"] = config["defaultChatId"]
							delete(config, "defaultChatId")
							record.Set("config", config)
							changed = true
						}

					case "webhook":
						if _, ok := config["defaultDataForDeployment"]; ok {
							if existsData, exists := config["data"]; !exists || existsData == "" {
								config["data"] = config["defaultDataForDeployment"]
								delete(config, "defaultDataForDeployment")
								record.Set("config", config)
								changed = true
							}
						}
						if _, ok := config["defaultDataForNotification"]; ok {
							if existsData, exists := config["data"]; !exists || existsData == "" {
								config["data"] = config["defaultDataForNotification"]
								delete(config, "defaultDataForNotification")
								record.Set("config", config)
								changed = true
							}
						}
						if _, ok := config["dataForDeployment"]; ok {
							if existsData, exists := config["data"]; !exists || existsData == "" {
								config["data"] = config["dataForDeployment"]
								delete(config, "dataForDeployment")
								record.Set("config", config)
								changed = true
							}
						}
						if _, ok := config["dataForNotification"]; ok {
							if existsData, exists := config["data"]; !exists || existsData == "" {
								config["data"] = config["dataForNotification"]
								delete(config, "dataForNotification")
								record.Set("config", config)
								changed = true
							}
						}
					}

					if changed {
						if err := app.Save(record); err != nil {
							return err
						}

						tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
					}
				}
			}
		}

		// update collection `certificate`
		//   - modify field `source` candidates
		//   - rename field `effectAt` to `validityNotBefore`
		//   - rename field `expireAt` to `validityNotAfter`
		//   - rename field `acmeAccountUrl` to `acmeAcctUrl`
		//   - rename field `workflowId` to `workflowRef`
		//   - rename field `workflowRunId` to `workflowRunRef`
		//   - rename field `workflowOutputId`(aka `workflowOutputRef`)
		{
			collection, err := app.FindCollectionByNameOrId("4szxr9x43tpj6np")
			if err != nil {
				return err
			} else if collection != nil {
				if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
					"hidden": false,
					"id": "by9hetqi",
					"maxSelect": 1,
					"name": "source",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "select",
					"values": [
						"request",
						"upload"
					]
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
					"hidden": false,
					"id": "v40aqzpd",
					"max": "",
					"min": "",
					"name": "validityNotBefore",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "date"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
					"hidden": false,
					"id": "zgpdby2k",
					"max": "",
					"min": "",
					"name": "validityNotAfter",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "date"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text2045248758",
					"max": 0,
					"min": 0,
					"name": "acmeAcctUrl",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(15, []byte(`{
					"cascadeDelete": false,
					"collectionId": "tovyif5ax6j62ur",
					"hidden": false,
					"id": "uvqfamb1",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "workflowRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(16, []byte(`{
					"cascadeDelete": false,
					"collectionId": "qjp8lygssgwyqyz",
					"hidden": false,
					"id": "relation3917999135",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "workflowRunRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				collection.Fields.RemoveByName("workflowOutputId")
				collection.Fields.RemoveByName("workflowOutputRef")

				if err := json.Unmarshal([]byte(`{
					"indexes": [
						"CREATE INDEX `+"`"+`idx_Jx8TXzDCmw`+"`"+` ON `+"`"+`certificate`+"`"+` (`+"`"+`workflowRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_2cRXqNDyyp`+"`"+` ON `+"`"+`certificate`+"`"+` (`+"`"+`workflowRunRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_kcKpgAZapk`+"`"+` ON `+"`"+`certificate`+"`"+` (`+"`"+`workflowNodeId`+"`"+`)"
					]
				}`), &collection); err != nil {
					return err
				}

				if err := app.Save(collection); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE certificate SET source = 'request' WHERE source = 'workflow'").Execute(); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)
			}
		}

		// update collection `workflow`
		//   - modify field `trigger` candidates, and cascading migrate field `graphDraft` / `graphContent`
		//   - modify field `lastRunStatus` candidates
		//   - rename field `lastRunRefId` to `lastRunRef`
		//   - rename field `draft` to `graphDraft`
		//   - rename field `content` to `graphContent`
		//   - add field `hasContent`
		{
			collection, err := app.FindCollectionByNameOrId("tovyif5ax6j62ur")
			if err != nil {
				return err
			} else if collection != nil {
				if err := collection.Fields.AddMarshaledJSONAt(3, []byte(`{
					"hidden": false,
					"id": "vqoajwjq",
					"maxSelect": 1,
					"name": "trigger",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "select",
					"values": [
						"manual",
						"scheduled"
					]
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
					"hidden": false,
					"id": "g9ohkk5o",
					"maxSize": 5000000,
					"name": "graphDraft",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "json"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
					"hidden": false,
					"id": "awlphkfe",
					"maxSize": 5000000,
					"name": "graphContent",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "json"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
					"hidden": false,
					"id": "bool3832150317",
					"name": "hasContent",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "bool"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
					"cascadeDelete": false,
					"collectionId": "qjp8lygssgwyqyz",
					"hidden": false,
					"id": "a23wkj9x",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "lastRunRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
					"hidden": false,
					"id": "zivdxh23",
					"maxSelect": 1,
					"name": "lastRunStatus",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "select",
					"values": [
						"pending",
						"processing",
						"succeeded",
						"failed",
						"canceled"
					]
				}`)); err != nil {
					return err
				}

				if err := app.Save(collection); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow SET trigger = 'scheduled' WHERE trigger = 'auto'").Execute(); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow SET hasContent = TRUE WHERE graphContent IS NOT NULL").Execute(); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow SET lastRunStatus = 'processing' WHERE lastRunStatus = 'running'").Execute(); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)

				records, err := app.FindAllRecords(collection)
				if err != nil {
					return err
				} else {
					for _, record := range records {
						changed := false

						graphDraft := make(map[string]any)
						if err := record.UnmarshalJSONField("graphDraft", &graphDraft); err == nil {
							if _, ok := graphDraft["config"]; ok {
								config := graphDraft["config"].(map[string]any)
								if _, ok := config["trigger"]; ok {
									trigger := config["trigger"].(string)
									if trigger == "auto" {
										config["trigger"] = "scheduled"
										record.Set("graphDraft", graphDraft)
										changed = true
									}
								}
							}
						}

						graphContent := make(map[string]any)
						if err := record.UnmarshalJSONField("graphContent", &graphContent); err == nil {
							if _, ok := graphContent["config"]; ok {
								config := graphContent["config"].(map[string]any)
								if _, ok := config["trigger"]; ok {
									trigger := config["trigger"].(string)
									if trigger == "auto" {
										config["trigger"] = "scheduled"
										record.Set("graphContent", graphContent)
										changed = true
									}
								}
							}
						}

						if changed {
							if err := app.Save(record); err != nil {
								return err
							}

							tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
						}
					}
				}
			}
		}

		// update collection `workflow_run`
		//   - modify field `trigger` candidates, and cascading migrate field `graph`
		//   - modify field `status` candidates
		//   - rename field `detail` to `graph`
		//   - rename field `workflowId` to `workflowRef`
		{
			collection, err := app.FindCollectionByNameOrId("qjp8lygssgwyqyz")
			if err != nil {
				return err
			} else if collection != nil {
				if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
					"cascadeDelete": true,
					"collectionId": "tovyif5ax6j62ur",
					"hidden": false,
					"id": "m8xfsyyy",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "workflowRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
					"hidden": false,
					"id": "qldmh0tw",
					"maxSelect": 1,
					"name": "status",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "select",
					"values": [
						"pending",
						"processing",
						"succeeded",
						"failed",
						"canceled"
					]
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(3, []byte(`{
					"hidden": false,
					"id": "jlroa3fk",
					"maxSelect": 1,
					"name": "trigger",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "select",
					"values": [
						"manual",
						"scheduled"
					]
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
					"hidden": false,
					"id": "json772177811",
					"maxSize": 5000000,
					"name": "graph",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "json"
				}`)); err != nil {
					return err
				}

				if err := json.Unmarshal([]byte(`{
					"indexes": [
						"CREATE INDEX `+"`"+`idx_7ZpfjTFsD2`+"`"+` ON `+"`"+`workflow_run`+"`"+` (`+"`"+`workflowRef`+"`"+`)"
					]
				}`), &collection); err != nil {
					return err
				}

				if err := app.Save(collection); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow_run SET trigger = 'scheduled' WHERE trigger = 'auto'").Execute(); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow_run SET status = 'processing' WHERE status = 'running'").Execute(); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)

				records, err := app.FindAllRecords(collection)
				if err != nil {
					return err
				} else {
					for _, record := range records {
						changed := false

						graphContent := make(map[string]any)
						if err := record.UnmarshalJSONField("graph", &graphContent); err == nil {
							if _, ok := graphContent["config"]; ok {
								config := graphContent["config"].(map[string]any)
								if _, ok := config["trigger"]; ok {
									trigger := config["trigger"].(string)
									if trigger == "auto" {
										config["trigger"] = "scheduled"
										record.Set("graph", graphContent)
										changed = true
									}
								}
							}
						}

						if changed {
							if err := app.Save(record); err != nil {
								return err
							}

							tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
						}
					}
				}
			}
		}

		// update collection `workflow_output`
		//   - rename field `workflowId` to `workflowRef`
		//   - rename field `runId` to `runRef`
		//   - rename field `node` to `nodeConfig`
		{
			collection, err := app.FindCollectionByNameOrId("bqnxb95f2cooowp")
			if err != nil {
				return err
			} else if collection != nil {
				if err := json.Unmarshal([]byte(`{
					"indexes": [
						"CREATE INDEX `+"`"+`idx_BYoQPsz4my`+"`"+` ON `+"`"+`workflow_output`+"`"+` (`+"`"+`workflowRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_O9zxLETuxJ`+"`"+` ON `+"`"+`workflow_output`+"`"+` (`+"`"+`runRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_luac8Ul34G`+"`"+` ON `+"`"+`workflow_output`+"`"+` (`+"`"+`nodeId`+"`"+`)"
					]
				}`), &collection); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
					"cascadeDelete": true,
					"collectionId": "tovyif5ax6j62ur",
					"hidden": false,
					"id": "jka88auc",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "workflowRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
					"cascadeDelete": true,
					"collectionId": "qjp8lygssgwyqyz",
					"hidden": false,
					"id": "relation821863227",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "runRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
					"hidden": false,
					"id": "json2239752261",
					"maxSize": 5000000,
					"name": "nodeConfig",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "json"
				}`)); err != nil {
					return err
				}

				if err := app.Save(collection); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)
			}
		}

		// update collection `workflow_logs`
		//   - modify field `level` type
		//   - rename field `workflowId` to `workflowRef`
		//   - rename field `runId` to `runRef`
		//   - migrate field `message`
		{
			collection, err := app.FindCollectionByNameOrId("pbc_1682296116")
			if err != nil {
				return err
			} else if collection != nil {
				if field := collection.Fields.GetByName("level"); field != nil && field.Type() == "text" {
					if _, err := app.DB().NewQuery("UPDATE workflow_logs SET level = '-4' WHERE level = 'DEBUG'").Execute(); err != nil {
						return err
					}
					if _, err := app.DB().NewQuery("UPDATE workflow_logs SET level = '0' WHERE level = 'INFO'").Execute(); err != nil {
						return err
					}
					if _, err := app.DB().NewQuery("UPDATE workflow_logs SET level = '4' WHERE level = 'WARN'").Execute(); err != nil {
						return err
					}
					if _, err := app.DB().NewQuery("UPDATE workflow_logs SET level = '8' WHERE level = 'ERROR'").Execute(); err != nil {
						return err
					}

					if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
						"hidden": false,
						"id": "number760395071",
						"max": null,
						"min": null,
						"name": "levelTmp",
						"onlyInt": false,
						"presentable": false,
						"required": false,
						"system": false,
						"type": "number"
					}`)); err != nil {
						return err
					}
					if err := app.Save(collection); err != nil {
						return err
					}

					if _, err := app.DB().NewQuery("UPDATE workflow_logs SET levelTmp = level").Execute(); err != nil {
						return err
					}

					collection.Fields.RemoveById(field.GetId())
					if err := app.Save(collection); err != nil {
						return err
					}

					if err := collection.Fields.AddMarshaledJSONAt(6, []byte(`{
						"hidden": false,
						"id": "number760395071",
						"max": null,
						"min": null,
						"name": "level",
						"onlyInt": false,
						"presentable": false,
						"required": false,
						"system": false,
						"type": "number"
					}`)); err != nil {
						return err
					}
					if err := app.Save(collection); err != nil {
						return err
					}
				}

				if err := collection.Fields.AddMarshaledJSONAt(1, []byte(`{
					"cascadeDelete": true,
					"collectionId": "tovyif5ax6j62ur",
					"hidden": false,
					"id": "relation3371272342",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "workflowRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
					"cascadeDelete": true,
					"collectionId": "qjp8lygssgwyqyz",
					"hidden": false,
					"id": "relation821863227",
					"maxSelect": 1,
					"minSelect": 0,
					"name": "runRef",
					"presentable": false,
					"required": false,
					"system": false,
					"type": "relation"
				}`)); err != nil {
					return err
				}

				if err := json.Unmarshal([]byte(`{
					"indexes": [
						"CREATE INDEX `+"`"+`idx_IOlpy6XuJ2`+"`"+` ON `+"`"+`workflow_logs`+"`"+` (`+"`"+`workflowRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_qVlTb2yl7v`+"`"+` ON `+"`"+`workflow_logs`+"`"+` (`+"`"+`runRef`+"`"+`)",
						"CREATE INDEX `+"`"+`idx_UL4tdCXNlA`+"`"+` ON `+"`"+`workflow_logs`+"`"+` (`+"`"+`nodeId`+"`"+`)"
					]
				}`), &collection); err != nil {
					return err
				}

				if _, err := app.DB().NewQuery("UPDATE workflow_logs SET message = REPLACE(message, 'certificiate', 'certificate') WHERE level = 0").Execute(); err != nil {
					return err
				}
				if _, err := app.DB().NewQuery("UPDATE workflow_logs SET message = REPLACE(message, 'ready to apply certificate', 'ready to request certificate') WHERE level = 0").Execute(); err != nil {
					return err
				}
				if _, err := app.DB().NewQuery("UPDATE workflow_logs SET message = REPLACE(message, 'ready to obtain certificate', 'ready to request certificate') WHERE level = 0").Execute(); err != nil {
					return err
				}

				if err := app.Save(collection); err != nil {
					return err
				}

				tracer.Printf("collection '%s' updated", collection.Name)
			}
		}

		// adapt to new workflow data structure
		{
			type dLegacyWorkflowNode struct {
				Id       string                 `json:"id"`
				Type     string                 `json:"type"`
				Name     string                 `json:"name"`
				Config   map[string]any         `json:"config,omitempty"`
				Next     *dLegacyWorkflowNode   `json:"next,omitempty"`
				Branches []*dLegacyWorkflowNode `json:"branches,omitempty"`
			}

			type dWorkflowNodeData struct {
				Name   string         `json:"name"`
				Config map[string]any `json:"config,omitempty"`
			}

			type dWorkflowNode struct {
				Id     string            `json:"id"`
				Type   string            `json:"type"`
				Data   dWorkflowNodeData `json:"data"`
				Blocks []*dWorkflowNode  `json:"blocks,omitempty"`
			}

			convertNode := func(root *dLegacyWorkflowNode) []*dWorkflowNode {
				lang := lo.
					IfF(root == nil, func() string { return "zh" }).
					ElseIf(regexp.MustCompile(`[\p{Han}]`).MatchString(root.Name), "zh").
					Else("en")

				var deepConvertNode func(node *dLegacyWorkflowNode) []*dWorkflowNode
				deepConvertNode = func(node *dLegacyWorkflowNode) []*dWorkflowNode {
					temp := make([]*dWorkflowNode, 0)

					current := node
					for current != nil {
						current.Config = lo.PickBy(current.Config, func(key string, value any) bool {
							str, ok := value.(string)
							return !ok || str != ""
						})

						switch current.Type {
						case "start":
							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "start",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "apply":
							if _, ok := current.Config["challengeType"].(string); !ok {
								current.Config["challengeType"] = "dns-01"
							}

							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "bizApply",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "upload":
							if _, ok := current.Config["source"].(string); !ok {
								current.Config["source"] = "form"
							}

							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "bizUpload",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "monitor":
							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "bizMonitor",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "deploy":
							if s, ok := current.Config["certificate"].(string); ok {
								current.Config["certificateOutputNodeId"] = strings.Split(s, "#")[0]
								delete(current.Config, "certificate")
							}

							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "bizDeploy",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "notify":
							if _, ok := current.Config["channel"].(string); ok {
								delete(current.Config, "channel")
							}

							temp = append(temp, &dWorkflowNode{
								Id:   current.Id,
								Type: "bizNotify",
								Data: dWorkflowNodeData{
									Name:   current.Name,
									Config: current.Config,
								},
							})

						case "execute_result_branch":
							if len(temp) == 0 {
								break
							}

							tryNode, _ := lo.Last(temp)
							temp = lo.DropRight(temp, 1)

							branches := lo.GroupBy(current.Branches, func(b *dLegacyWorkflowNode) string { return b.Type })
							successBranch := lo.IfF(len(branches["execute_success"]) > 0, func() *dLegacyWorkflowNode {
								return branches["execute_success"][0]
							}).Else(nil)
							failureBranch := lo.IfF(len(branches["execute_failure"]) > 0, func() *dLegacyWorkflowNode {
								return branches["execute_failure"][0]
							}).Else(nil)
							successBranchId := lo.If(successBranch != nil, successBranch.Id).Else(core.GenerateDefaultRandomId())
							failureBranchId := lo.If(failureBranch != nil, failureBranch.Id).Else(core.GenerateDefaultRandomId())

							catchBlocks := lo.If(failureBranch != nil && failureBranch.Next != nil, deepConvertNode(failureBranch.Next)).Else([]*dWorkflowNode{})
							catchBlocks = append(catchBlocks, &dWorkflowNode{
								Id:   core.GenerateDefaultRandomId(),
								Type: "end",
								Data: dWorkflowNodeData{
									Name: lo.If(lang == "en", "End").Else("结束"),
								},
							})

							tryCatchNode := &dWorkflowNode{
								Id:   current.Id,
								Type: "tryCatch",
								Data: dWorkflowNodeData{
									Name:   lo.If(lang == "en", "Try to ...").Else("尝试执行…"),
									Config: current.Config,
								},
								Blocks: []*dWorkflowNode{
									{
										Id:   successBranchId,
										Type: "tryBlock",
										Data: dWorkflowNodeData{
											Name: "",
										},
										Blocks: []*dWorkflowNode{tryNode},
									},
									{
										Id:   failureBranchId,
										Type: "catchBlock",
										Data: dWorkflowNodeData{
											Name: lo.If(lang == "en", "On failed ...").Else("若执行失败…"),
										},
										Blocks: catchBlocks,
									},
								},
							}

							temp = append(temp, tryCatchNode)
							current = successBranch

						case "branch":
							branchNode := &dWorkflowNode{
								Id:   current.Id,
								Type: "condition",
								Data: dWorkflowNodeData{
									Name:   lo.If(lang == "en", "Parallel").Else("并行"),
									Config: current.Config,
								},
								Blocks: lo.Map(current.Branches, func(b *dLegacyWorkflowNode, _ int) *dWorkflowNode {
									return &dWorkflowNode{
										Id:   b.Id,
										Type: "branchBlock",
										Data: dWorkflowNodeData{
											Name:   b.Name,
											Config: b.Config,
										},
										Blocks: deepConvertNode(b.Next),
									}
								}),
							}

							temp = append(temp, branchNode)
						}

						if current != nil {
							current = current.Next
						}
					}

					return temp
				}

				nodes := lo.Ternary(root == nil, []*dWorkflowNode{
					{
						Id:   core.GenerateDefaultRandomId(),
						Type: "start",
						Data: dWorkflowNodeData{
							Name: lo.If(lang == "en", "Start").Else("开始"),
						},
					},
				}, deepConvertNode(root))

				return append(nodes, &dWorkflowNode{
					Id:   core.GenerateDefaultRandomId(),
					Type: "end",
					Data: dWorkflowNodeData{
						Name: lo.If(lang == "en", "End").Else("结束"),
					},
				})
			}

			// update collection `workflow`
			//   - migrate field `graphDraft` / `graphContent`
			{
				collection, err := app.FindCollectionByNameOrId("tovyif5ax6j62ur")
				if err != nil {
					return err
				} else if collection != nil {
					records, err := app.FindAllRecords(collection)
					if err != nil {
						return err
					} else {
						for _, record := range records {
							changed := false

							graphDraft := make(map[string]any)
							if err := record.UnmarshalJSONField("graphDraft", &graphDraft); err == nil {
								if len(graphDraft) > 0 {
									if _, ok := graphDraft["nodes"]; !ok {
										legacyRootNode := &dLegacyWorkflowNode{}
										if err := record.UnmarshalJSONField("graphDraft", legacyRootNode); err != nil {
											return err
										} else {
											graphDraft = make(map[string]any)
											graphDraft["nodes"] = convertNode(legacyRootNode)
											record.Set("graphDraft", graphDraft)
											changed = true
										}
									}
								}
							}

							graphContent := make(map[string]any)
							if err := record.UnmarshalJSONField("graphContent", &graphContent); err == nil {
								if len(graphContent) > 0 {
									if _, ok := graphContent["nodes"]; !ok {
										legacyRootNode := &dLegacyWorkflowNode{}
										if err := record.UnmarshalJSONField("graphContent", legacyRootNode); err != nil {
											return err
										} else {
											graphContent = make(map[string]any)
											graphContent["nodes"] = convertNode(legacyRootNode)
											record.Set("graphContent", graphContent)
											record.Set("hasContent", true)
											changed = true
										}
									}
								}
							}

							if changed {
								if err := app.Save(record); err != nil {
									return err
								}

								tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
							}
						}
					}
				}
			}

			// update collection `workflow_run`
			//   - migrate field `graph`
			{
				collection, err := app.FindCollectionByNameOrId("qjp8lygssgwyqyz")
				if err != nil {
					return err
				} else if collection != nil {
					records, err := app.FindAllRecords(collection)
					if err != nil {
						return err
					} else {
						for _, record := range records {
							changed := false

							graphContent := make(map[string]any)
							if err := record.UnmarshalJSONField("graph", &graphContent); err == nil {
								if len(graphContent) > 0 {
									if _, ok := graphContent["nodes"]; !ok {
										legacyRootNode := &dLegacyWorkflowNode{}
										if err := record.UnmarshalJSONField("graph", legacyRootNode); err != nil {
											return err
										} else {
											graphContent = make(map[string]any)
											graphContent["nodes"] = convertNode(legacyRootNode)
											record.Set("graph", graphContent)
											changed = true
										}
									}
								}
							}

							if changed {
								if err := app.Save(record); err != nil {
									return err
								}

								tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
							}
						}
					}
				}
			}

			// update collection `workflow_output`
			//   - migrate field `nodeConfig`
			//   - migrate field `outputs`
			{
				collection, err := app.FindCollectionByNameOrId("bqnxb95f2cooowp")
				if err != nil {
					return err
				} else if collection != nil {
					records, err := app.FindAllRecords(collection)
					if err != nil {
						return err
					} else {
						for _, record := range records {
							changed := false

							nodeConfig := make(map[string]any)
							if err := record.UnmarshalJSONField("nodeConfig", &nodeConfig); err == nil {
								if _, ok := nodeConfig["id"]; ok {
									if _, ok := nodeConfig["type"]; ok {
										if _, ok := nodeConfig["config"]; ok {
											record.Set("nodeConfig", nodeConfig["config"])
											changed = true
										}
									}
								}
							}

							outputs := make([]map[string]any, 0)
							if err := record.UnmarshalJSONField("outputs", &outputs); err == nil {
								for i, output := range outputs {
									if _, ok := output["label"]; ok {
										output["valueType"] = "string"
										delete(output, "label")
										delete(output, "required")
										delete(output, "valueSelector")

										if output["type"] == "certificate" {
											output["type"] = "ref"
											output["value"] = fmt.Sprintf("certificate#%s", output["value"])
										}

										outputs[i] = output
									} else {
										continue
									}
									record.Set("outputs", outputs)
									changed = true
								}
							}

							if changed {
								if err := app.Save(record); err != nil {
									return err
								}

								tracer.Printf("record #%s in collection '%s' updated", record.Id, collection.Name)
							}
						}
					}
				}
			}

			// normalize field `nodeId` in collection `workflow`, `workflow_run`, `workflow_output`, `workflow_logs`
			for i := 0; i < 3; i++ {
				app.DB().NewQuery(`UPDATE workflow SET graphDraft=REPLACE(graphDraft, '"id":"-', '"id":"')`).Execute()
				app.DB().NewQuery(`UPDATE workflow SET graphDraft=REPLACE(graphDraft, '"id":"_', '"id":"')`).Execute()
				app.DB().NewQuery(`UPDATE workflow SET graphContent=REPLACE(graphContent, '"id":"-', '"id":"')`).Execute()
				app.DB().NewQuery(`UPDATE workflow SET graphContent=REPLACE(graphContent, '"id":"_', '"id":"')`).Execute()

				app.DB().NewQuery(`UPDATE workflow_run SET graph=REPLACE(graph, '"id":"-', '"id":"')`).Execute()
				app.DB().NewQuery(`UPDATE workflow_run SET graph=REPLACE(graph, '"id":"_', '"id":"')`).Execute()

				app.DB().NewQuery(`UPDATE workflow_output SET nodeId=SUBSTR(nodeId, 2) WHERE nodeId LIKE '-%'`).Execute()
				app.DB().NewQuery(`UPDATE workflow_output SET nodeId=SUBSTR(nodeId, 2) WHERE nodeId LIKE '_%'`).Execute()

				app.DB().NewQuery(`UPDATE workflow_logs SET nodeId=SUBSTR(nodeId, 2) WHERE nodeId LIKE '-%'`).Execute()
				app.DB().NewQuery(`UPDATE workflow_logs SET nodeId=SUBSTR(nodeId, 2) WHERE nodeId LIKE '_%'`).Execute()
			}
		}

		tracer.Printf("done")
		return nil
	}, func(app core.App) error {
		return nil
	})
}
