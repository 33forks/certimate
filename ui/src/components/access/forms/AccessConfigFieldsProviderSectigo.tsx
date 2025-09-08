import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const AccessConfigFormFieldsProviderSectigo = () => {
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
        name={[parentNamePath, "validationType"]}
        initialValue={initialValues.validationType}
        label={t("access.form.sectigo_validation_type.label")}
        rules={[formRule]}
      >
        <Select
          options={["dv", "ov", "ev"].map((s) => ({
            key: s,
            label: t(`access.form.sectigo_validation_type.option.${s}.label`),
            value: s,
          }))}
          placeholder={t("access.form.sectigo_validation_type.placeholder")}
        />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "eabKid"]}
        initialValue={initialValues.eabKid}
        label={t("access.form.sectigo_eab_kid.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.sectigo_eab_kid.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.sectigo_eab_kid.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "eabHmacKey"]}
        initialValue={initialValues.eabHmacKey}
        label={t("access.form.sectigo_eab_hmac_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.sectigo_eab_hmac_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.sectigo_eab_hmac_key.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    validationType: "dv",
    eabKid: "",
    eabHmacKey: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    validationType: z.string().nonempty(t("access.form.sectigo_validation_type.placeholder")),
    eabKid: z
      .string()
      .min(1, t("access.form.sectigo_eab_kid.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
    eabHmacKey: z
      .string()
      .min(1, t("access.form.sectigo_eab_hmac_key.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
};

const _default = Object.assign(AccessConfigFormFieldsProviderSectigo, {
  getInitialValues,
  getSchema,
});

export default _default;
