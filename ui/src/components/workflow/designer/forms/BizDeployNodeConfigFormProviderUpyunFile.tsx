import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import Tips from "@/components/Tips";
import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFormProviderUpyunFile = () => {
  const { i18n, t } = useTranslation();

  const { parentNamePath } = useFormNestedFieldsContext();
  const formSchema = z.object({
    [parentNamePath]: getSchema({ i18n }),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const initialValues = getInitialValues();

  return (
    <>
      <Form.Item>
        <Tips message={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.upyun_file.guide") }}></span>} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "domain"]}
        initialValue={initialValues.domain}
        label={t("workflow_node.deploy.form.upyun_file_domain.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.upyun_file_domain.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.upyun_file_domain.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    domain: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    domain: z.string().refine((v) => validDomainName(v), t("common.errmsg.domain_invalid")),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderUpyunFile, {
  getInitialValues,
  getSchema,
});

export default _default;
