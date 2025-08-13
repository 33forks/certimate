import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { validEmailAddress } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const BizNotifyNodeConfigFormProviderEmail = () => {
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
        name={[parentNamePath, "receiverAddress"]}
        initialValue={initialValues.receiverAddress}
        label={t("workflow_node.notify.form.email_receiver_address.label")}
        extra={t("workflow_node.notify.form.email_receiver_address.help")}
        rules={[formRule]}
      >
        <Input type="email" allowClear placeholder={t("workflow_node.notify.form.email_receiver_address.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {};
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    receiverAddress: z
      .string()
      .nullish()
      .refine((v) => {
        if (!v) return true;
        return validEmailAddress(v);
      }, t("common.errmsg.email_invalid")),
  });
};

const _default = Object.assign(BizNotifyNodeConfigFormProviderEmail, {
  getInitialValues,
  getSchema,
});

export default _default;
