import { memo, useRef, useState } from "react";
import { IconDotsVertical, IconFilter, IconFilterFilled } from "@tabler/icons-react";
import { Button, Card, Popover } from "antd";
import { produce } from "immer";

import { useZustandShallowSelector } from "@/hooks";
import { useWorkflowStore } from "@/stores/workflow";

import SharedNode, { type SharedNodeProps } from "./_SharedNode";
import AddNode from "./AddNode";
import ConditionNodeConfigForm, { type ConditionNodeConfigFormFieldValues, type ConditionNodeConfigFormInstance } from "./ConditionNodeConfigForm";

export interface ConditionNodeProps extends SharedNodeProps {
  branchId: string;
  branchIndex: number;
}

const ConditionNode = ({ node, disabled, branchId, branchIndex }: ConditionNodeProps) => {
  const { updateNode } = useWorkflowStore(useZustandShallowSelector(["updateNode"]));

  const [formPending, setFormPending] = useState(false);
  const formRef = useRef<ConditionNodeConfigFormInstance>(null);
  const getFormValues = () => formRef.current!.getFieldsValue() as ConditionNodeConfigFormFieldValues;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerConfirm = async () => {
    setFormPending(true);
    try {
      await formRef.current!.validateFields();
    } catch (err) {
      setFormPending(false);
      throw err;
    }

    try {
      const newValues = getFormValues();
      const newNode = produce(node, (draft) => {
        draft.config = {
          ...newValues,
        };
        draft.validated = true;
      });
      await updateNode(newNode);
    } finally {
      setFormPending(false);
    }
  };

  return (
    <>
      <Popover
        classNames={{ root: "mt-20 shadow-md" }}
        styles={{ body: { padding: 0 } }}
        arrow={false}
        content={
          <SharedNode.Menu
            node={node}
            branchId={branchId}
            branchIndex={branchIndex}
            disabled={disabled}
            trigger={<Button color="primary" icon={<IconDotsVertical size="1em" />} variant="text" />}
          />
        }
        placement="rightTop"
      >
        <div className="relative z-1 mt-10 w-[256px]">
          <Card className="shadow-md" styles={{ body: { padding: 0 } }} hoverable onClick={() => setDrawerOpen(true)}>
            <div className="flex h-[48px] flex-col items-center justify-center truncate px-4 py-2">
              <div className="relative w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <SharedNode.Title
                  className="overflow-hidden outline-slate-200 focus:rounded-xs focus:bg-background focus:text-foreground"
                  node={node}
                  disabled={disabled}
                />
                <div className="absolute top-1/2 right-0 -translate-y-1/2" onClick={() => setDrawerOpen(true)}>
                  {node.config?.expression ? (
                    <Button color="primary" icon={<IconFilterFilled size="1em" />} variant="link" />
                  ) : (
                    <Button color="default" icon={<IconFilter size="1em" />} variant="link" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Popover>

      <SharedNode.ConfigDrawer
        getConfigNewValues={getFormValues}
        node={node}
        open={drawerOpen}
        pending={formPending}
        onConfirm={handleDrawerConfirm}
        onOpenChange={(open) => setDrawerOpen(open)}
      >
        <ConditionNodeConfigForm nodeId={node.id} ref={formRef} disabled={disabled} initialValues={node.config} />
      </SharedNode.ConfigDrawer>

      <AddNode node={node} disabled={disabled} />
    </>
  );
};

export default memo(ConditionNode);
