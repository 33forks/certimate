import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const AccessConfigFormFieldsProviderEdgio = () => {
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
        name={[parentNamePath, "clientId"]}
        initialValue={initialValues.clientId}
        label={t("access.form.edgio_client_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.edgio_client_id.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.edgio_client_id.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "clientSecret"]}
        initialValue={initialValues.clientSecret}
        label={t("access.form.edgio_client_secret.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.edgio_client_secret.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.edgio_client_secret.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    clientId: "",
    clientSecret: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    clientId: z
      .string()
      .min(1, t("access.form.edgio_client_id.placeholder"))
      .max(64, t("common.errmsg.string_max", { max: 64 })),
    clientSecret: z
      .string()
      .min(1, t("access.form.edgio_client_secret.placeholder"))
      .max(64, t("common.errmsg.string_max", { max: 64 })),
  });
};

const _default = Object.assign(AccessConfigFormFieldsProviderEdgio, {
  getInitialValues,
  getSchema,
});

export default _default;
