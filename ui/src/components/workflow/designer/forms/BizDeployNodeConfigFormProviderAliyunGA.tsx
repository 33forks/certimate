import { getI18n, useTranslation } from "react-i18next";
import { Form, Input, Select } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import Show from "@/components/Show";
import { validDomainName } from "@/utils/validators";

import { useFormNestedFieldsContext } from "./_context";

const RESOURCE_TYPE_ACCELERATOR = "accelerator" as const;
const RESOURCE_TYPE_LISTENER = "listener" as const;

const BizDeployNodeConfigFormProviderAliyunGA = () => {
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
        name={[parentNamePath, "resourceType"]}
        initialValue={initialValues.resourceType}
        label={t("workflow_node.deploy.form.aliyun_ga_resource_type.label")}
        rules={[formRule]}
      >
        <Select placeholder={t("workflow_node.deploy.form.aliyun_ga_resource_type.placeholder")}>
          <Select.Option key={RESOURCE_TYPE_ACCELERATOR} value={RESOURCE_TYPE_ACCELERATOR}>
            {t("workflow_node.deploy.form.aliyun_ga_resource_type.option.accelerator.label")}
          </Select.Option>
          <Select.Option key={RESOURCE_TYPE_LISTENER} value={RESOURCE_TYPE_LISTENER}>
            {t("workflow_node.deploy.form.aliyun_ga_resource_type.option.listener.label")}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={[parentNamePath, "acceleratorId"]}
        initialValue={initialValues.acceleratorId}
        label={t("workflow_node.deploy.form.aliyun_ga_accelerator_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_ga_accelerator_id.tooltip") }}></span>}
      >
        <Input placeholder={t("workflow_node.deploy.form.aliyun_ga_accelerator_id.placeholder")} />
      </Form.Item>

      <Show when={fieldResourceType === RESOURCE_TYPE_LISTENER}>
        <Form.Item
          name={[parentNamePath, "listenerId"]}
          initialValue={initialValues.listenerId}
          label={t("workflow_node.deploy.form.aliyun_ga_listener_id.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_ga_listener_id.tooltip") }}></span>}
        >
          <Input placeholder={t("workflow_node.deploy.form.aliyun_ga_listener_id.placeholder")} />
        </Form.Item>
      </Show>

      <Show when={fieldResourceType === RESOURCE_TYPE_ACCELERATOR || fieldResourceType === RESOURCE_TYPE_LISTENER}>
        <Form.Item
          name={[parentNamePath, "domain"]}
          initialValue={initialValues.domain}
          label={t("workflow_node.deploy.form.aliyun_ga_snidomain.label")}
          rules={[formRule]}
          tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.deploy.form.aliyun_ga_snidomain.tooltip") }}></span>}
        >
          <Input allowClear placeholder={t("workflow_node.deploy.form.aliyun_ga_snidomain.placeholder")} />
        </Form.Item>
      </Show>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    resourceType: RESOURCE_TYPE_LISTENER,
    acceleratorId: "",
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n: ReturnType<typeof getI18n> }) => {
  const { t } = i18n;

  return z
    .object({
      resourceType: z.literal([RESOURCE_TYPE_ACCELERATOR, RESOURCE_TYPE_LISTENER], t("workflow_node.deploy.form.aliyun_ga_resource_type.placeholder")),
      acceleratorId: z.string().nonempty(t("workflow_node.deploy.form.aliyun_ga_accelerator_id.placeholder")),
      listenerId: z.string().nullish(),
      domain: z
        .string()
        .nullish()
        .refine((v) => {
          return !v || validDomainName(v!);
        }, t("common.errmsg.domain_invalid")),
    })
    .superRefine((values, ctx) => {
      switch (values.resourceType) {
        case RESOURCE_TYPE_LISTENER:
          {
            if (!values.listenerId?.trim()) {
              ctx.addIssue({
                code: "custom",
                message: t("workflow_node.deploy.form.aliyun_ga_listener_id.placeholder"),
                path: ["listenerId"],
              });
            }
          }
          break;
      }
    });
};

const _default = Object.assign(BizDeployNodeConfigFormProviderAliyunGA, {
  getInitialValues,
  getSchema,
});

export default _default;
