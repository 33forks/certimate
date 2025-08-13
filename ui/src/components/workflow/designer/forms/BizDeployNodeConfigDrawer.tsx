import { useTranslation } from "react-i18next";
import { type FlowNodeEntity } from "@flowgram.ai/fixed-layout-editor";
import { Form } from "antd";

import { NodeConfigDrawer } from "./_shared";
import BizDeployNodeConfigForm from "./BizDeployNodeConfigForm";
import { NodeType } from "../nodes/typings";

export interface BizDeployNodeConfigDrawerProps {
  loading?: boolean;
  node: FlowNodeEntity;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BizDeployNodeConfigDrawer = ({ node, ...props }: BizDeployNodeConfigDrawerProps) => {
  if (node.flowNodeType !== NodeType.BizDeploy) {
    console.warn(`[certimate] current workflow node type is not: ${NodeType.BizDeploy}`);
  }

  const { i18n } = useTranslation();

  const [formInst] = Form.useForm();

  const fieldProvider = Form.useWatch<string>("provider", { form: formInst, preserve: true });

  return (
    <NodeConfigDrawer
      anchor={fieldProvider ? { items: BizDeployNodeConfigForm.getAnchorItems({ i18n }) } : false}
      footer={fieldProvider ? true : false}
      form={formInst}
      node={node}
      {...props}
    >
      <BizDeployNodeConfigForm form={formInst} node={node} />
    </NodeConfigDrawer>
  );
};

export default BizDeployNodeConfigDrawer;
