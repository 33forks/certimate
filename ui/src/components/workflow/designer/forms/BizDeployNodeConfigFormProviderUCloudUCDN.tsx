import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFormProviderUCloudUCDN = () => {
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
        name={[parentNamePath, "domainId"]}
        initialValue={initialValues.domainId}
        label={t("workflow_node.deploy.form.ucloud_ucdn_domain_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.ucloud_ucdn_domain_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.ucloud_ucdn_domain_id.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    domainId: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    domainId: z.string().nonempty(t("workflow_node.deploy.form.ucloud_ucdn_domain_id.placeholder")),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderUCloudUCDN, {
  getInitialValues,
  getSchema,
});

export default _default;
