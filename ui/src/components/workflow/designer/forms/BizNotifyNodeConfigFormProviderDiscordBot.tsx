import { getI18n, useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const BizNotifyNodeConfigFormProviderDiscordBot = () => {
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
        name={[parentNamePath, "channelId"]}
        initialValue={initialValues.channelId}
        label={t("workflow_node.notify.form.discordbot_channel_id.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("workflow_node.notify.form.discordbot_channel_id.tooltip") }}></span>}
      >
        <Input allowClear placeholder={t("workflow_node.notify.form.discordbot_channel_id.placeholder")} />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {};
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t: _ } = i18n;

  return z.object({
    channelId: z.string().nullish(),
  });
};

const _default = Object.assign(BizNotifyNodeConfigFormProviderDiscordBot, {
  getInitialValues,
  getSchema,
});

export default _default;
