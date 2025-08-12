import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Switch } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import MultipleSplitValueInput from "@/components/MultipleSplitValueInput";
import Tips from "@/components/Tips";

import { useFormNestedFieldsContext } from "./_context";

const MULTIPLE_INPUT_SEPARATOR = ";";

const BizDeployNodeConfigFormProviderTencentCloudSSLUpdate = () => {
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
        <Tips message={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate.guide") }}></span>} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "endpoint"]}
        initialValue={initialValues.endpoint}
        label={t("workflow_node.deploy.form.tencentcloud_sslupdate_endpoint.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate_endpoint.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.deploy.form.tencentcloud_sslupdate_endpoint.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "certificateId"]}
        initialValue={initialValues.certificateId}
        label={t("workflow_node.deploy.form.tencentcloud_sslupdate_certificate_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate_certificate_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.tencentcloud_sslupdate_certificate_id.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "resourceTypes"]}
        initialValue={initialValues.resourceTypes}
        label={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.label")}
        extra={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.help")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.tooltip") }}></span>}
      >
        <MultipleSplitValueInput
          modalTitle={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.multiple_input_modal.title")}
          placeholder={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.placeholder")}
          placeholderInModal={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.multiple_input_modal.placeholder")}
          separator={MULTIPLE_INPUT_SEPARATOR}
          splitOptions={{ removeEmpty: true, trimSpace: true }}
        />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "resourceRegions"]}
        initialValue={initialValues.resourceRegions}
        label={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.label")}
        extra={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.help")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.tooltip") }}></span>}
      >
        <MultipleSplitValueInput
          modalTitle={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.multiple_input_modal.title")}
          placeholder={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.placeholder")}
          placeholderInModal={t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.multiple_input_modal.placeholder")}
          separator={MULTIPLE_INPUT_SEPARATOR}
          splitOptions={{ removeEmpty: true, trimSpace: true }}
        />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "isReplaced"]}
        initialValue={initialValues.isReplaced}
        label={t("workflow_node.deploy.form.tencentcloud_sslupdate_is_replaced.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_sslupdate_is_replaced.tooltip") }}></span>}
      >
        <Switch />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    certificateId: "",
    resourceTypes: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z.object({
    endpoint: z.string().nullish(),
    certificateId: z.string().nonempty(t("workflow_node.deploy.form.tencentcloud_sslupdate_certificate_id.placeholder")),
    resourceTypes: z.string().refine((v) => {
      if (!v) return false;
      return String(v)
        .split(MULTIPLE_INPUT_SEPARATOR)
        .every((e) => !!e.trim());
    }, t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_types.placeholder")),
    resourceRegions: z
      .string()
      .nullish()
      .refine((v) => {
        if (!v) return true;
        return String(v)
          .split(MULTIPLE_INPUT_SEPARATOR)
          .every((e) => !!e.trim());
      }, t("workflow_node.deploy.form.tencentcloud_sslupdate_resource_regions.placeholder")),
    isReplaced: z.boolean().nullish(),
  });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderTencentCloudSSLUpdate, {
  getInitialValues,
  getSchema,
});

export default _default;
