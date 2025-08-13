import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import Show from "@/components/Show";
import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const RESOURCE_TYPE_LOADBALANCER = "loadbalancer" as const;
const RESOURCE_TYPE_LISTENER = "listener" as const;
const RESOURCE_TYPE_RULEDOMAIN = "ruledomain" as const;
const RESOURCE_TYPE_VIA_SSLDEPLOY = "ssl-deploy" as const;

const BizDeployNodeConfigFormProviderTencentCloudCLB = () => {
  const { i18n, t } = useTranslation();

  const { parentNamePath } = useFormNestedFieldsContext();
  const formSchema = z.object({
    [parentNamePath]: getSchema({ i18n }),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const formInst = Form.useFormInstance();
  const initialValues = getInitialValues();

  const fieldResourceType = Form.useWatch([parentNamePath, "resourceType"], formInst);

  return (
    <>
      <Form.Item
        name={[parentNamePath, "endpoint"]}
        initialValue={initialValues.endpoint}
        label={t("workflow_node.deploy.form.tencentcloud_clb_endpoint.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_endpoint.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.deploy.form.tencentcloud_clb_endpoint.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "region"]}
        initialValue={initialValues.region}
        label={t("workflow_node.deploy.form.tencentcloud_clb_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.tencentcloud_clb_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "resourceType"]}
        initialValue={initialValues.resourceType}
        label={t("workflow_node.deploy.form.tencentcloud_clb_resource_type.label")}
        rules={[formRule]}
      >
        <Select placeholder={t("workflow_node.deploy.form.tencentcloud_clb_resource_type.placeholder")}>
          <Select.Option key={RESOURCE_TYPE_LOADBALANCER} value={RESOURCE_TYPE_LOADBALANCER}>
            {t("workflow_node.deploy.form.tencentcloud_clb_resource_type.option.loadbalancer.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_LISTENER} value={RESOURCE_TYPE_LISTENER}>
            {t("workflow_node.deploy.form.tencentcloud_clb_resource_type.option.listener.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_RULEDOMAIN} value={RESOURCE_TYPE_RULEDOMAIN}>
            {t("workflow_node.deploy.form.tencentcloud_clb_resource_type.option.ruledomain.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_VIA_SSLDEPLOY} value={RESOURCE_TYPE_VIA_SSLDEPLOY}>
            {t("workflow_node.deploy.form.tencentcloud_clb_resource_type.option.ssl_deploy.label")}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "loadbalancerId"]}
        initialValue={initialValues.loadbalancerId}
        label={t("workflow_node.deploy.form.tencentcloud_clb_loadbalancer_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_loadbalancer_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.tencentcloud_clb_loadbalancer_id.placeholder")} />
      </Form.Item>

      <Show
        when={
          fieldResourceType === RESOURCE_TYPE_VIA_SSLDEPLOY || fieldResourceType === RESOURCE_TYPE_LISTENER || fieldResourceType === RESOURCE_TYPE_RULEDOMAIN
        }
      >
        <Form.Item
          name={[parentNamePath, "listenerId"]}
          initialValue={initialValues.listenerId}
          label={t("workflow_node.deploy.form.tencentcloud_clb_listener_id.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_listener_id.tooltip") }}></span>}
        >
          <Input placeholder={t("workflow_node.deploy.form.tencentcloud_clb_listener_id.placeholder")} />
        </Form.Item>
      </Show>

      <Show when={fieldResourceType === RESOURCE_TYPE_VIA_SSLDEPLOY}>
        <Form.Item
          name={[parentNamePath, "domain"]}
          initialValue={initialValues.domain}
          label={t("workflow_node.deploy.form.tencentcloud_clb_snidomain.label")}
          extra={t("workflow_node.deploy.form.tencentcloud_clb_snidomain.help")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_snidomain.tooltip") }}></span>}
        >
          <Input allowClear placeholder={t("workflow_node.deploy.form.tencentcloud_clb_snidomain.placeholder")} />
        </Form.Item>
      </Show>

      <Show when={fieldResourceType === RESOURCE_TYPE_RULEDOMAIN}>
        <Form.Item
          name={[parentNamePath, "domain"]}
          initialValue={initialValues.domain}
          label={t("workflow_node.deploy.form.tencentcloud_clb_ruledomain.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.tencentcloud_clb_ruledomain.tooltip") }}></span>}
        >
          <Input placeholder={t("workflow_node.deploy.form.tencentcloud_clb_ruledomain.placeholder")} />
        </Form.Item>
      </Show>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    region: "",
    resourceType: RESOURCE_TYPE_LISTENER,
    loadbalancerId: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z
    .object({
      endpoint: z.string().nullish(),
      resourceType: z.literal(
        [RESOURCE_TYPE_LOADBALANCER, RESOURCE_TYPE_LISTENER, RESOURCE_TYPE_RULEDOMAIN, RESOURCE_TYPE_VIA_SSLDEPLOY],
        t("workflow_node.deploy.form.tencentcloud_clb_resource_type.placeholder")
      ),
      region: z.string().nonempty(t("workflow_node.deploy.form.tencentcloud_clb_region.placeholder")),
      loadbalancerId: z.string().nonempty(t("workflow_node.deploy.form.tencentcloud_clb_loadbalancer_id.placeholder")),
      listenerId: z.string().nullish(),
      domain: z.string().nullish(),
    })
    .superRefine((values, ctx) => {
      switch (values.resourceType) {
        case RESOURCE_TYPE_LISTENER:
          {
            if (!values.listenerId?.trim()) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.tencentcloud_clb_listener_id.placeholder"),
                path: ["listenerId"],
              });
            }
          }
          break;

        case RESOURCE_TYPE_RULEDOMAIN:
          {
            if (!values.listenerId?.trim()) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.tencentcloud_clb_listener_id.placeholder"),
                path: ["listenerId"],
              });
            }

            if (!validDomainName(values.domain!, { allowWildcard: true })) {
              ctx.addIssue({
                code: "custom",
                message: t("common.errmsg.domain_invalid"),
                path: ["domain"],
              });
            }
          }
          break;

        case RESOURCE_TYPE_VIA_SSLDEPLOY:
          {
            if (!values.listenerId?.trim()) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.tencentcloud_clb_listener_id.placeholder"),
                path: ["listenerId"],
              });
            }
          }
          break;
      }
    });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderTencentCloudCLB, {
  getInitialValues,
  getSchema,
});

export default _default;
