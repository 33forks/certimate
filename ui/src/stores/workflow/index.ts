import { produce } from "immer";
import { isEqual } from "radash";
import { create } from "zustand";

import { WORKFLOW_NODE_TYPES, type WorkflowModel, type WorkflowNodeConfigForStart } from "@/domain/workflow";
import { get as getWorkflow, save as saveWorkflow, subscribe as subscribeWorkflow } from "@/repository/workflow";

import { type WorkflowStore } from "./types";

export const useWorkflowStore = create<WorkflowStore>((set, get) => {
  const ensureInitialized = () => {
    if (!get().initialized) throw "Workflow not initialized yet";
  };

  let unsubscriber: (() => void) | undefined;

  return {
    workflow: {} as WorkflowModel,
    initialized: false,

    init: async (id: string) => {
      const data = await getWorkflow(id);
      set({
        workflow: data,
        initialized: true,
      });

      unsubscriber ??= await subscribeWorkflow(id, (cb) => {
        if (cb.record.id !== get().workflow.id) return;

        set({
          workflow: cb.record,
        });
      });
    },

    destroy: () => {
      unsubscriber?.();
      unsubscriber = void 0;

      set({
        workflow: {} as WorkflowModel,
        initialized: false,
      });
    },

    setName: async (name) => {
      ensureInitialized();

      const resp = await saveWorkflow({
        id: get().workflow.id!,
        name: name || "",
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.name = resp.name;
          }),
        };
      });
    },

    setDescription: async (description) => {
      ensureInitialized();

      const resp = await saveWorkflow({
        id: get().workflow.id!,
        description: description || "",
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.description = resp.description;
          }),
        };
      });
    },

    setEnabled: async (enabled) => {
      ensureInitialized();

      const resp = await saveWorkflow({
        id: get().workflow.id!,
        enabled: enabled,
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.enabled = resp.enabled;
          }),
        };
      });
    },

    setDraft: async (draft) => {
      ensureInitialized();

      const resp = await saveWorkflow({
        id: get().workflow.id!,
        draft: draft,
        hasDraft: !isEqual(draft, get().workflow.content),
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.draft = resp.draft;
            draft.hasDraft = resp.hasDraft;
          }),
        };
      });
    },

    publish: async () => {
      ensureInitialized();

      const tree = get().workflow.draft!;
      if (tree?.nodes?.[0]?.type !== WORKFLOW_NODE_TYPES.START) throw "Workflow nodes tree of draft in invalid";
      const startConfig = tree.nodes[0].data.config as WorkflowNodeConfigForStart;
      const resp = await saveWorkflow({
        id: get().workflow.id!,
        trigger: startConfig.trigger,
        triggerCron: startConfig.triggerCron,
        content: tree,
        hasContent: true,
        hasDraft: false,
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.trigger = resp.trigger;
            draft.triggerCron = resp.triggerCron;
            draft.content = resp.content;
            draft.hasContent = resp.hasContent;
            draft.hasDraft = resp.hasDraft;
          }),
        };
      });
    },

    rollback: async () => {
      ensureInitialized();

      const tree = get().workflow.content!;
      if (tree?.nodes?.[0]?.type !== WORKFLOW_NODE_TYPES.START) throw "Workflow nodes tree of content in invalid";
      const startConfig = tree.nodes[0].data.config as WorkflowNodeConfigForStart;
      const resp = await saveWorkflow({
        id: get().workflow.id!,
        trigger: startConfig.trigger,
        triggerCron: startConfig.triggerCron,
        hasContent: true,
        draft: tree,
        hasDraft: false,
      });

      set((state) => {
        return {
          workflow: produce(state.workflow, (draft) => {
            draft.trigger = resp.trigger;
            draft.triggerCron = resp.triggerCron;
            draft.hasContent = resp.hasContent;
            draft.draft = resp.draft;
            draft.hasDraft = resp.hasDraft;
          }),
        };
      });
    },
  };
});
