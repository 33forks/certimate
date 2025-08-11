import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const ENVIRONMENT_PRODUCTION = "production" as const;
const ENVIRONMENT_STAGING = "stating" as const;

const BizDeployNodeConfigFormProviderWangsuCDNPro = () => {
  const { i18n, t } = useTranslation();

  const { parentNamePath } = useFormNestedFieldsContext();
  const formSchema = z.object({
    [parentNamePath]: getSchema({ i18n }),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const initialValues = getInitialValues();

  return (
    <>
      <Form.Item
        name={[parentNamePath, "environment"]}
        initialValue={initialValues.environment}
        label={t("workflow_node.deploy.form.wangsu_cdnpro_environment.label")}
        rules={[formRule]}
      >
        <Select placeholder={t("workflow_node.deploy.form.wangsu_cdnpro_environment.placeholder")}>
          <Select.Option key={ENVIRONMENT_PRODUCTION} value={ENVIRONMENT_PRODUCTION}>
            {t("workflow_node.deploy.form.wangsu_cdnpro_environment.option.production.label")}
          </Select.Option>
          <Select.Option key={ENVIRONMENT_STAGING} value={ENVIRONMENT_STAGING}>
            {t("workflow_node.deploy.form.wangsu_cdnpro_environment.option.staging.label")}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "domain"]}
        initialValue={initialValues.domain}
        label={t("workflow_node.deploy.form.wangsu_cdnpro_domain.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.wangsu_cdnpro_domain.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.wangsu_cdnpro_domain.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "certificateId"]}
        initialValue={initialValues.certificateId}
        label={t("workflow_node.deploy.form.wangsu_cdnpro_certificate_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.wangsu_cdnpro_certificate_id.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.deploy.form.wangsu_cdnpro_certificate_id.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "webhookId"]}
        initialValue={initialValues.webhookId}
        label={t("workflow_node.deploy.form.wangsu_cdnpro_webhook_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.wangsu_cdnpro_webhook_id.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.deploy.form.wangsu_cdnpro_webhook_id.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    environment: ENVIRONMENT_PRODUCTION,
    domain: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    environment: z.literal([ENVIRONMENT_PRODUCTION, ENVIRONMENT_STAGING], t("workflow_node.deploy.form.wangsu_cdnpro_environment.placeholder")),
    domain: z.string().refine((v) => validDomainName(v, { allowWildcard: true }), t("common.errmsg.domain_invalid")),
    certificateId: z.string().nullish(),
    webhookId: z.string().nullish(),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderWangsuCDNPro, {
  getInitialValues,
  getSchema,
});

export default _default;
