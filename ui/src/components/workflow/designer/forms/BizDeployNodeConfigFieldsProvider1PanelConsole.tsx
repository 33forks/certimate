import { getI18n, useTranslation } from "react-i18next";
import { Form, Switch } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { z } from "zod";

import { useFormNestedFieldsContext } from "./_context";

const BizDeployNodeConfigFieldsProvider1PanelConsole = () => {
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
        name={[parentNamePath, "autoRestart"]}
        initialValue={initialValues.autoRestart}
        label={t("workflow_node.deploy.form.1panel_console_auto_restart.label")}
        rules={[formRule]}
      >
        <Switch />
      </Form.Item>
    </>
  );
};

const getInitialValues = (): Nullish<z.infer<ReturnType<typeof getSchema>>> => {
  return {
    autoRestart: true,
  };
};

const getSchema = ({ i18n = getI18n() }: { i18n?: ReturnType<typeof getI18n> }) => {
  const { t: _ } = i18n;

  return z.object({
    autoRestart: z.boolean().nullish(),
  });
};

const _default = Object.assign(BizDeployNodeConfigFieldsProvider1PanelConsole, {
  getInitialValues,
  getSchema,
});

export default _default;
