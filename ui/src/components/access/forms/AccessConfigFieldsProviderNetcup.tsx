import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const AccessConfigFormFieldsProviderNetcup = () => {
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
        name={[parentNamePath, "customerNumber"]}
        initialValue={initialValues.customerNumber}
        label={t("access.form.netcup_customer_number.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.netcup_customer_number.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.netcup_customer_number.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "apiKey"]}
        initialValue={initialValues.apiKey}
        label={t("access.form.netcup_api_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.netcup_api_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.netcup_api_key.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "apiPassword"]}
        initialValue={initialValues.apiPassword}
        label={t("access.form.netcup_api_password.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.netcup_api_password.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.netcup_api_password.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    customerNumber: "",
    apiKey: "",
    apiPassword: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    customerNumber: z.string().nonempty(t("access.form.netcup_customer_number.placeholder")),
    apiKey: z.string().nonempty(t("access.form.netcup_api_key.placeholder")),
    apiPassword: z.string().nonempty(t("access.form.netcup_api_password.placeholder")),
  });
};

const _default = Object.assign(AccessConfigFormFieldsProviderNetcup, {
  getInitialValues,
  getSchema,
});

export default _default;
