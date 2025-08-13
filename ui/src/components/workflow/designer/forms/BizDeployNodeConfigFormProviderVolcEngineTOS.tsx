import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFormProviderVolcEngineTOS = () => {
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
        name={[parentNamePath, "region"]}
        initialValue={initialValues.region}
        label={t("workflow_node.deploy.form.volcengine_tos_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.volcengine_tos_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.volcengine_tos_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "bucket"]}
        initialValue={initialValues.bucket}
        label={t("workflow_node.deploy.form.volcengine_tos_bucket.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.volcengine_tos_bucket.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.volcengine_tos_bucket.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "domain"]}
        initialValue={initialValues.domain}
        label={t("workflow_node.deploy.form.volcengine_tos_domain.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.volcengine_tos_domain.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.volcengine_tos_domain.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    region: "",
    bucket: "",
    domain: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    region: z.string().nonempty(t("workflow_node.deploy.form.volcengine_tos_region.placeholder")),
    bucket: z.string().nonempty(t("workflow_node.deploy.form.volcengine_tos_bucket.placeholder")),
    domain: z.string().refine((v) => validDomainName(v), t("common.errmsg.domain_invalid")),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderVolcEngineTOS, {
  getInitialValues,
  getSchema,
});

export default _default;
