import { getI18n, useTranslation } from "react-i18next";
import { AutoComplete, Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const AccessConfigFormFieldsProviderAzure = () => {
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
        name={[parentNamePath, "tenantId"]}
        initialValue={initialValues.tenantId}
        label={t("access.form.azure_tenant_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.azure_tenant_id.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.azure_tenant_id.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "clientId"]}
        initialValue={initialValues.clientId}
        label={t("access.form.azure_client_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.azure_client_id.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.azure_client_id.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "clientSecret"]}
        initialValue={initialValues.clientSecret}
        label={t("access.form.azure_client_secret.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.azure_client_secret.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.azure_client_secret.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "cloudName"]}
        initialValue={initialValues.cloudName}
        label={t("access.form.azure_cloud_name.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.azure_cloud_name.tooltip") }}></span>}
      >
        <AutoComplete
          options={["public", "azureusgovernment", "azurechina"].map((value) => ({ value }))}
          placeholder={t("access.form.azure_cloud_name.placeholder")}
          filterOption={(inputValue, option) => option!.value.toLowerCase().includes(inputValue.toLowerCase())}
        />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    tenantId: "",
    clientId: "",
    clientSecret: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    tenantId: z
      .string()
      .min(1, t("access.form.azure_tenant_id.placeholder"))
      .max(64, t("common.errmsg.string_max", { max: 64 })),
    clientId: z
      .string()
      .min(1, t("access.form.azure_client_id.placeholder"))
      .max(64, t("common.errmsg.string_max", { max: 64 })),
    clientSecret: z
      .string()
      .min(1, t("access.form.azure_client_secret.placeholder"))
      .max(64, t("common.errmsg.string_max", { max: 64 })),
    cloudName: z.string().nullish(),
  });
};

const _default = Object.assign(AccessConfigFormFieldsProviderAzure, {
  getInitialValues,
  getSchema,
});

export default _default;
