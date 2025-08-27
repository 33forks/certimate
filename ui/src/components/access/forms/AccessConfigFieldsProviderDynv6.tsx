import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const AccessConfigFormFieldsProviderDynv6 = () => {
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
        name={[parentNamePath, "httpToken"]}
        initialValue={initialValues.httpToken}
        label={t("access.form.dynv6_http_token.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.dynv6_http_token.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.dynv6_http_token.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    httpToken: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    httpToken: z
      .string()
      .min(1, t("access.form.dynv6_http_token.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
};

const _default = Object.assign(AccessConfigFormFieldsProviderDynv6, {
  getInitialValues,
  getSchema,
});

export default _default;
