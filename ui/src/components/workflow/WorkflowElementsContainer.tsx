﻿import { useState } from "react";
import { IconMaximize, IconMinus, IconPlus } from "@tabler/icons-react";
import { Button, Card, Typography } from "antd";

import WorkflowElements from "@/components/workflow/WorkflowElements";
import { mergeCls } from "@/utils/css";

export interface WorkflowElementsProps {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const WorkflowElementsContainer = ({ className, style, disabled }: WorkflowElementsProps) => {
  const [scale, setScale] = useState(1);

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 2;
  const STEP_SCALE = 0.05;

  return (
    <div className={mergeCls("relative size-full overflow-hidden", className)} style={style}>
      <div className="size-full overflow-auto">
        <div className="relative z-1">
          <div className="origin-center transition-transform duration-300" style={{ zoom: `${scale}` }}>
            <div className="p-4">
              <WorkflowElements disabled={disabled} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-6 bottom-4 z-2">
        <Card className="rounded-lg p-2 shadow-lg" styles={{ body: { padding: 0 } }}>
          <div className="flex items-center gap-2">
            <Button icon={<IconMinus size="1.25em" />} disabled={scale <= MIN_SCALE} onClick={() => setScale((s) => Math.max(MIN_SCALE, s - STEP_SCALE))} />
            <Typography.Text className="min-w-12 text-center">{Math.round(scale * 100)}%</Typography.Text>
            <Button icon={<IconPlus size="1.25em" />} disabled={scale >= MAX_SCALE} onClick={() => setScale((s) => Math.min(MAX_SCALE, s + STEP_SCALE))} />
            <Button icon={<IconMaximize size="1.25em" />} onClick={() => setScale(1)} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowElementsContainer;
