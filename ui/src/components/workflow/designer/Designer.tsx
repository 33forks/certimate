import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import {
  ConstantKeys,
  EditorRenderer,
  FixedLayoutEditorProvider,
  type FixedLayoutPluginContext,
  type FixedLayoutProps,
  type FlowDocumentJSON,
  type FlowNodeEntity,
  FlowTextKey,
  getNodeForm,
} from "@flowgram.ai/fixed-layout-editor";
import { createMinimapPlugin } from "@flowgram.ai/minimap-plugin";
import "@flowgram.ai/fixed-layout-editor/index.css";
import { theme } from "antd";

import { DegisnerContextProvider } from "./DesignerContext";
import { getAllElements } from "./elements";
import NodeRender from "./NodeRender";
import { getAllNodeRegistries } from "./nodes";
import { BranchNode } from "./nodes/_shared";
import "./flowgram.css";

export interface DesignerProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  initialData?: FlowDocumentJSON;
  readonly?: boolean;
  onDocumentChange?: (ctx: FixedLayoutPluginContext) => void;
  onNodeChange?: (ctx: FixedLayoutPluginContext, node: FlowNodeEntity) => void;
  onNodeClick?: (ctx: FixedLayoutPluginContext, node: FlowNodeEntity) => void;
}

export interface DesignerInstance extends FixedLayoutPluginContext {
  validateNode(node: string | FlowNodeEntity): Promise<boolean>;
  validateAllNodes(): Promise<boolean>;
}

const Designer = forwardRef<DesignerInstance, DesignerProps>(
  ({ className, style, children, initialData, readonly, onDocumentChange, onNodeChange, onNodeClick }, ref) => {
    const { token: themeToken } = theme.useToken();

    const rendered = useRef(false);

    const flowgramEditorRef = useRef<FixedLayoutPluginContext>(null);
    const flowgramEditorProps = useMemo<FixedLayoutProps>(
      () => ({
        initialData: initialData,

        constants: {
          [ConstantKeys.BASE_COLOR]: themeToken.colorBorder,
          [ConstantKeys.BASE_ACTIVATED_COLOR]: themeToken.colorPrimary,
          [ConstantKeys.NODE_SPACING]: 48,
          [ConstantKeys.BRANCH_SPACING]: 48,
        },

        background: {
          backgroundColor: themeToken.colorBgContainer,
          dotSize: 0,
        },

        playground: {
          autoFocus: true,
          autoResize: true,
          preventGlobalGesture: true,
        },

        selectBox: {
          enable: false,
        },

        scroll: {
          enableScrollLimit: true,
        },

        readonly: readonly,

        nodeEngine: {
          enable: true,
        },

        variableEngine: {
          enable: true,
        },

        materials: {
          components: getAllElements(),
          renderTexts: {
            [FlowTextKey.TRY_START_TEXT]: "Try",
            [FlowTextKey.TRY_END_TEXT]: "Then",
            [FlowTextKey.CATCH_TEXT]: "Catch",
          },
          renderDefaultNode: NodeRender,
        },

        nodeRegistries: getAllNodeRegistries(),

        getNodeDefaultRegistry(type) {
          return {
            type,
            meta: {
              defaultExpanded: true,
            },
            formMeta: {
              render: () => <BranchNode description={type} />,
            },
          };
        },

        plugins: () => [
          createMinimapPlugin({
            disableLayer: true,
            enableDisplayAllNodes: true,
            canvasStyle: {
              canvasWidth: 160,
              canvasHeight: 160,
            },
          }),
        ],

        onAllLayersRendered: (ctx) => {
          rendered.current = true;

          // 画布初始化后向下滚动一点，露出可能被 Alert 遮挡的部分
          setTimeout(() => {
            ctx.playground.config.scroll({ scrollY: -80 });
          }, 1);
        },
      }),
      [themeToken, initialData, readonly, onDocumentChange]
    );

    useEffect(() => {
      const d = flowgramEditorRef.current!.document.originTree.onTreeChange(() => {
        if (rendered.current) {
          onDocumentChange?.(flowgramEditorRef.current!);
        }
      });

      return () => d.dispose();
    }, [onDocumentChange]);

    useImperativeHandle(ref, () => {
      return {
        get clipboard() {
          return flowgramEditorRef.current!.clipboard;
        },
        get container() {
          return flowgramEditorRef.current!.container;
        },
        get document() {
          return flowgramEditorRef.current!.document;
        },
        get history() {
          return flowgramEditorRef.current!.history;
        },
        get operation() {
          return flowgramEditorRef.current!.operation;
        },
        get playground() {
          return flowgramEditorRef.current!.playground;
        },
        get selection() {
          return flowgramEditorRef.current!.selection;
        },
        get tools() {
          return flowgramEditorRef.current!.tools;
        },

        get(identifier) {
          return flowgramEditorRef.current!.get(identifier);
        },
        getAll(identifier) {
          return flowgramEditorRef.current!.getAll(identifier);
        },
        validateNode(node) {
          if (typeof node === "string") {
            node = flowgramEditorRef.current!.document.getNode(node)!;
          }

          const form = getNodeForm(node);
          return form ? form.validate().then((res) => res && !form.state.invalid) : Promise.resolve(true);
        },
        validateAllNodes() {
          const nodes = flowgramEditorRef.current!.document.getAllNodes();
          const forms = nodes.map((node) => getNodeForm(node)).filter((form) => form != null);
          return Promise.allSettled(forms.map((form) => form.validate())).then((res) => forms.every((form, index) => res[index] && !form.state.invalid));
        },
      };
    });

    return (
      <FixedLayoutEditorProvider ref={flowgramEditorRef} {...flowgramEditorProps}>
        <DegisnerContextProvider
          value={{
            onDocumentChange: () => onDocumentChange?.(flowgramEditorRef.current!),
            onNodeChange: (node) => onNodeChange?.(flowgramEditorRef.current!, node),
            onNodeClick: (node) => onNodeClick?.(flowgramEditorRef.current!, node),
          }}
        >
          <EditorRenderer className={className} style={style} />
          {children}
        </DegisnerContextProvider>
      </FixedLayoutEditorProvider>
    );
  }
);

export default Designer;
