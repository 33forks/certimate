import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const BizApplyNodeConfigFormProviderAWSRoute53 = () => {
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
        label={t("workflow_node.apply.form.aws_route53_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.apply.form.aws_route53_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.apply.form.aws_route53_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "hostedZoneId"]}
        initialValue={initialValues.hostedZoneId}
        label={t("workflow_node.apply.form.aws_route53_hosted_zone_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.apply.form.aws_route53_hosted_zone_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.apply.form.aws_route53_hosted_zone_id.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    region: "us-east-1",
    hostedZoneId: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    region: z.string().nonempty(t("workflow_node.apply.form.aws_route53_region.placeholder")),
    hostedZoneId: z.string().nonempty(t("workflow_node.apply.form.aws_route53_hosted_zone_id.placeholder")),
  });
};

const _default = Object.assign(BizApplyNodeConfigFormProviderAWSRoute53, {
  getInitialValues,
  getSchema,
});

export default _default;
