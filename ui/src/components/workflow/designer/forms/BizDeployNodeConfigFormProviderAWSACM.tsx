import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFormProviderAWSACM = () => {
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
        label={t("workflow_node.deploy.form.aws_acm_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aws_acm_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aws_acm_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "certificateArn"]}
        initialValue={initialValues.certificateArn}
        label={t("workflow_node.deploy.form.aws_acm_certificate_arn.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aws_acm_certificate_arn.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.deploy.form.aws_acm_certificate_arn.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    region: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    region: z.string().nonempty(t("workflow_node.deploy.form.aws_acm_region.placeholder")),
    certificateArn: z.string().nullish(),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderAWSACM, {
  getInitialValues,
  getSchema,
});

export default _default;
