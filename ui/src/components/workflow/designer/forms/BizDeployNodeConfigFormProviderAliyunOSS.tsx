import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFormProviderAliyunOSS = () => {
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
        label={t("workflow_node.deploy.form.aliyun_oss_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_oss_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_oss_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "bucket"]}
        initialValue={initialValues.bucket}
        label={t("workflow_node.deploy.form.aliyun_oss_bucket.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_oss_bucket.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_oss_bucket.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "domain"]}
        initialValue={initialValues.domain}
        label={t("workflow_node.deploy.form.aliyun_oss_domain.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_oss_domain.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_oss_domain.placeholder")} />
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
    region: z.string().nonempty(t("workflow_node.deploy.form.aliyun_oss_region.placeholder")),
    bucket: z.string().nonempty(t("workflow_node.deploy.form.aliyun_oss_bucket.placeholder")),
    domain: z.string().refine((v) => validDomainName(v, { allowWildcard: true }), t("common.errmsg.domain_invalid")),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderAliyunOSS, {
  getInitialValues,
  getSchema,
});

export default _default;
