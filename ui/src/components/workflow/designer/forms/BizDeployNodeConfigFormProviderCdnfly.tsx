import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import Show from "@/components/Show";

import { useFormNestedFieldsContext } from "./_context";

const RESOURCE_TYPE_SITE = "site" as const;
const RESOURCE_TYPE_CERTIFICATE = "certificate" as const;

const BizDeployNodeConfigFormProviderCdnfly = () => {
  const { i18n, t } = useTranslation();

  const { parentNamePath } = useFormNestedFieldsContext();
  const formSchema = z.object({
    [parentNamePath]: getSchema({ i18n }),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const formInst = Form.useFormInstance();
  const initialValues = getInitialValues();

  const fieldResourceType = Form.useWatch([parentNamePath, "resourceType"], formInst);

  return (
    <>
      <Form.Item
        name={[parentNamePath, "resourceType"]}
        initialValue={initialValues.resourceType}
        label={t("workflow_node.deploy.form.cdnfly_resource_type.label")}
        rules={[formRule]}
      >
        <Select placeholder={t("workflow_node.deploy.form.cdnfly_resource_type.placeholder")}>
          <Select.Option key={RESOURCE_TYPE_SITE} value={RESOURCE_TYPE_SITE}>
            {t("workflow_node.deploy.form.cdnfly_resource_type.option.site.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_CERTIFICATE} value={RESOURCE_TYPE_CERTIFICATE}>
            {t("workflow_node.deploy.form.cdnfly_resource_type.option.certificate.label")}
          </Select.Option>
        </Select>
      </Form.Item>

      <Show when={fieldResourceType === RESOURCE_TYPE_SITE}>
        <Form.Item
          name={[parentNamePath, "siteId"]}
          initialValue={initialValues.siteId}
          label={t("workflow_node.deploy.form.cdnfly_site_id.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.cdnfly_site_id.tooltip") }}></span>}
        >
          <Input type="number" placeholder={t("workflow_node.deploy.form.cdnfly_site_id.placeholder")} />
        </Form.Item>
      </Show>

      <Show when={fieldResourceType === RESOURCE_TYPE_CERTIFICATE}>
        <Form.Item
          name={[parentNamePath, "certificateId"]}
          initialValue={initialValues.certificateId}
          label={t("workflow_node.deploy.form.cdnfly_certificate_id.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.cdnfly_certificate_id.tooltip") }}></span>}
        >
          <Input type="number" placeholder={t("workflow_node.deploy.form.cdnfly_certificate_id.placeholder")} />
        </Form.Item>
      </Show>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    resourceType: RESOURCE_TYPE_SITE,
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z
    .object({
      resourceType: z.literal([RESOURCE_TYPE_SITE, RESOURCE_TYPE_CERTIFICATE], t("workflow_node.deploy.form.cdnfly_resource_type.placeholder")),
      siteId: z.union([z.string(), z.number().int()]).nullish(),
      certificateId: z.union([z.string(), z.number().int()]).nullish(),
    })
    .superRefine((values, ctx) => {
      switch (values.resourceType) {
        case RESOURCE_TYPE_SITE:
          {
            const res = z.preprocess((v) => Number(v), z.number().int().positive()).safeParse(values.siteId);
            if (!res.success) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.cdnfly_site_id.placeholder"),
                path: ["siteId"],
              });
            }
          }
          break;

        case RESOURCE_TYPE_CERTIFICATE:
          {
            const res = z.preprocess((v) => Number(v), z.number().int().positive()).safeParse(values.certificateId);
            if (!res.success) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.cdnfly_certificate_id.placeholder"),
                path: ["certificateId"],
              });
            }
          }
          break;
      }
    });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderCdnfly, {
  getInitialValues,
  getSchema,
});

export default _default;
