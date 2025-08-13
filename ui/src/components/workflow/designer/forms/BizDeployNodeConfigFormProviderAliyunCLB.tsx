import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import Show from "@/components/Show";
import { validDomainName, validPortNumber } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const RESOURCE_TYPE_LOADBALANCER = "loadbalancer" as const;
const RESOURCE_TYPE_LISTENER = "listener" as const;

const BizDeployNodeConfigFormProviderAliyunCLB = () => {
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
        name={[parentNamePath, "region"]}
        initialValue={initialValues.region}
        label={t("workflow_node.deploy.form.aliyun_clb_region.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_clb_region.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_clb_region.placeholder")} />
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "resourceType"]}
        initialValue={initialValues.resourceType}
        label={t("workflow_node.deploy.form.aliyun_clb_resource_type.label")}
        rules={[formRule]}
      >
        <Select placeholder={t("workflow_node.deploy.form.aliyun_clb_resource_type.placeholder")}>
          <Select.Option key={RESOURCE_TYPE_LOADBALANCER} value={RESOURCE_TYPE_LOADBALANCER}>
            {t("workflow_node.deploy.form.aliyun_clb_resource_type.option.loadbalancer.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_LISTENER} value={RESOURCE_TYPE_LISTENER}>
            {t("workflow_node.deploy.form.aliyun_clb_resource_type.option.listener.label")}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "loadbalancerId"]}
        initialValue={initialValues.loadbalancerId}
        label={t("workflow_node.deploy.form.aliyun_clb_loadbalancer_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_clb_loadbalancer_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_clb_loadbalancer_id.placeholder")} />
      </Form.Item>

      <Show when={fieldResourceType === RESOURCE_TYPE_LISTENER}>
        <Form.Item
          name={[parentNamePath, "listenerPort"]}
          initialValue={initialValues.listenerPort}
          label={t("workflow_node.deploy.form.aliyun_clb_listener_port.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_clb_listener_port.tooltip") }}></span>}
        >
          <Input type="number" min={1} max={65535} placeholder={t("workflow_node.deploy.form.aliyun_clb_listener_port.placeholder")} />
        </Form.Item>
      </Show>

      <Show when={fieldResourceType === RESOURCE_TYPE_LOADBALANCER || fieldResourceType === RESOURCE_TYPE_LISTENER}>
        <Form.Item
          name={[parentNamePath, "domain"]}
          initialValue={initialValues.domain}
          label={t("workflow_node.deploy.form.aliyun_clb_snidomain.label")}
          extra={t("workflow_node.deploy.form.aliyun_clb_snidomain.help")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_clb_snidomain.tooltip") }}></span>}
        >
          <Input allowClear placeholder={t("workflow_node.deploy.form.aliyun_clb_snidomain.placeholder")} />
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
    listenerPort: 443,
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z
    .object({
      region: z.string().nonempty(t("workflow_node.deploy.form.aliyun_clb_region.placeholder")),
      resourceType: z.literal([RESOURCE_TYPE_LOADBALANCER, RESOURCE_TYPE_LISTENER], t("workflow_node.deploy.form.aliyun_clb_resource_type.placeholder")),
      loadbalancerId: z.string().nonempty(t("workflow_node.deploy.form.aliyun_clb_loadbalancer_id.placeholder")),
      listenerPort: z.preprocess((v) => (v == null || v === "" ? undefined : Number(v)), z.number().nullish()),
      domain: z
        .string()
        .nullish()
        .refine((v) => {
          return !v || validDomainName(v!, { allowWildcard: true });
        }, t("common.errmsg.domain_invalid")),
    })
    .superRefine((values, ctx) => {
      switch (values.resourceType) {
        case RESOURCE_TYPE_LISTENER:
          {
            if (!validPortNumber(values.listenerPort!)) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.aliyun_clb_listener_port.placeholder"),
                path: ["listenerPort"],
              });
            }
          }
          break;
      }
    });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderAliyunCLB, {
  getInitialValues,
  getSchema,
});

export default _default;
