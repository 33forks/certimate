import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconCirclePlus, IconCopy, IconEdit, IconHierarchy3, IconPlus, IconReload, IconTrash } from "@tabler/icons-react";
import { useRequest } from "ahooks";
import { App, Button, Flex, Input, Segmented, Skeleton, Switch, Table, type TableProps, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { ClientResponseError } from "pocketbase";

import Empty from "@/components/Empty";
import WorkflowStatusIcon from "@/components/workflow/WorkflowStatusIcon";
import { WORKFLOW_TRIGGERS, type WorkflowModel, cloneNode, initWorkflow, isAllNodesValidated } from "@/domain/workflow";
import { list as listWorkflows, remove as removeWorkflow, save as saveWorkflow } from "@/repository/workflow";
import { getErrMsg } from "@/utils/error";

const WorkflowList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();

  const { message, modal, notification } = App.useApp();

  const [filters, setFilters] = useState<Record<string, unknown>>(() => {
    return {
      keyword: searchParams.get("keyword"),
      state: searchParams.get("state"),
    };
  });
  const [sorter, setSorter] = useState<ArrayElement<Parameters<NonNullable<TableProps<WorkflowModel>["onChange"]>>[2]>>(() => {
    return {};
  });
  const [page, setPage] = useState<number>(() => parseInt(+searchParams.get("page")! + "") || 1);
  const [pageSize, setPageSize] = useState<number>(() => parseInt(+searchParams.get("perPage")! + "") || 15);

  const tableColumns: TableProps<WorkflowModel>["columns"] = [
    {
      key: "$index",
      align: "center",
      fixed: "left",
      width: 50,
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "name",
      title: t("workflow.props.name"),
      render: (_, record) => (
        <div className="flex max-w-full flex-col gap-1 truncate">
          <Typography.Text ellipsis>{record.name || "\u00A0"}</Typography.Text>
          <Typography.Text ellipsis type="secondary">
            {record.description || "\u00A0"}
          </Typography.Text>
        </div>
      ),
    },
    {
      key: "trigger",
      title: t("workflow.props.trigger"),
      render: (_, record) => {
        const trigger = record.trigger;
        if (!trigger) {
          return "-";
        } else if (trigger === WORKFLOW_TRIGGERS.MANUAL) {
          return <Typography.Text>{t("workflow.props.trigger.manual")}</Typography.Text>;
        } else if (trigger === WORKFLOW_TRIGGERS.AUTO) {
          return (
            <div className="flex max-w-full flex-col gap-1">
              <Typography.Text>{t("workflow.props.trigger.auto")}</Typography.Text>
              <Typography.Text type="secondary">{record.triggerCron || "\u00A0"}</Typography.Text>
            </div>
          );
        }
      },
    },
    {
      key: "state",
      title: t("workflow.props.state"),
      defaultFilteredValue: searchParams.has("state") ? [searchParams.get("state") as string] : undefined,
      render: (_, record) => {
        const enabled = record.enabled;
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Switch
              checked={enabled}
              onChange={() => {
                handleRecordActiveChange(record);
              }}
            />
          </div>
        );
      },
    },
    {
      key: "lastRun",
      title: t("workflow.props.last_run_at"),
      sorter: true,
      sortOrder: sorter.columnKey === "lastRun" ? sorter.order : undefined,
      render: (_, record) => {
        return (
          <Flex gap="small">
            <WorkflowStatusIcon color={true} size="1.25em" status={record.lastRunStatus!} />
            <Typography.Text>{record.lastRunTime ? dayjs(record.lastRunTime!).format("YYYY-MM-DD HH:mm:ss") : ""}</Typography.Text>
          </Flex>
        );
      },
    },
    {
      key: "createdAt",
      title: t("workflow.props.created_at"),
      ellipsis: true,
      render: (_, record) => {
        return dayjs(record.created!).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      key: "$action",
      align: "end",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-end">
          <Tooltip title={t("common.button.edit")}>
            <Button
              color="primary"
              icon={<IconEdit size="1.25em" />}
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                handleRecordDetailClick(record);
              }}
            />
          </Tooltip>
          <Tooltip title={t("common.button.duplicate")}>
            <Button
              color="primary"
              icon={<IconCopy size="1.25em" />}
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                handleRecordDuplicateClick(record);
              }}
            />
          </Tooltip>
          <Tooltip title={t("common.button.delete")}>
            <Button
              color="danger"
              danger
              icon={<IconTrash size="1.25em" />}
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                handleRecordDeleteClick(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  const [tableData, setTableData] = useState<WorkflowModel[]>([]);
  const [tableTotal, setTableTotal] = useState<number>(0);

  const {
    loading,
    error: loadedError,
    run: refreshData,
  } = useRequest(
    () => {
      const { columnKey: sorterKey, order: sorterOrder } = sorter;
      let sort: string | undefined;
      sort = sorterKey === "lastRun" ? "lastRunTime" : "";
      sort = sort && (sorterOrder === "ascend" ? `${sort}` : sorterOrder === "descend" ? `-${sort}` : undefined);

      return listWorkflows({
        keyword: filters["keyword"] as string,
        enabled: (filters["state"] as string) === "enabled" ? true : (filters["state"] as string) === "disabled" ? false : undefined,
        sort: sort,
        page: page,
        perPage: pageSize,
      });
    },
    {
      refreshDeps: [filters, sorter, page, pageSize],
      onSuccess: (res) => {
        setTableData(res.items);
        setTableTotal(res.totalItems);
      },
      onError: (err) => {
        if (err instanceof ClientResponseError && err.isAbort) {
          return;
        }

        console.error(err);
        notification.error({ message: t("common.text.request_error"), description: getErrMsg(err) });

        throw err;
      },
    }
  );

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, keyword: value.trim() }));
    setPage(1);
  };

  const handleReloadClick = () => {
    if (loading) return;

    refreshData();
  };

  const handleCreateClick = () => {
    navigate("/workflows/new");
  };

  const handleRecordDetailClick = (workflow: WorkflowModel) => {
    navigate(`/workflows/${workflow.id}`);
  };

  const handleRecordActiveChange = async (workflow: WorkflowModel) => {
    try {
      if (!workflow.enabled && (!workflow.content || !isAllNodesValidated(workflow.content))) {
        message.warning(t("workflow.action.enable.errmsg.uncompleted"));
        return;
      }

      const resp = await saveWorkflow({
        id: workflow.id,
        enabled: !tableData.find((item) => item.id === workflow.id)?.enabled,
      });
      if (resp) {
        setTableData((prev) => {
          return prev.map((item) => {
            if (item.id === workflow.id) {
              return resp;
            }
            return item;
          });
        });
      }
    } catch (err) {
      console.error(err);
      notification.error({ message: t("common.text.request_error"), description: getErrMsg(err) });
    }
  };

  const handleRecordDuplicateClick = (workflow: WorkflowModel) => {
    modal.confirm({
      title: t("workflow.action.duplicate.modal.title"),
      content: t("workflow.action.duplicate.modal.content", { name: workflow.name }),
      onOk: async () => {
        try {
          const workflowCopy = {
            name: `${workflow.name}-copy`,
            description: workflow.description,
            trigger: workflow.trigger,
            triggerCron: workflow.triggerCron,
            draft: workflow.content
              ? cloneNode(workflow.content, { withCopySuffix: false })
              : workflow.draft
                ? cloneNode(workflow.draft, { withCopySuffix: false })
                : initWorkflow().draft,
            hasDraft: true,
          } as WorkflowModel;
          const resp = await saveWorkflow(workflowCopy);
          if (resp) {
            refreshData();
          }
        } catch (err) {
          console.error(err);
          notification.error({ message: t("common.text.request_error"), description: getErrMsg(err) });
        }
      },
    });
  };

  const handleRecordDeleteClick = (workflow: WorkflowModel) => {
    modal.confirm({
      title: <span className="text-error">{t("workflow.action.delete.modal.title")}</span>,
      content: <span dangerouslySetInnerHTML={{ __html: t("workflow.action.delete.modal.content", { name: workflow.name }) }} />,
      icon: (
        <span className="anticon" role="img">
          <IconTrash className="text-error" size="1em" />
        </span>
      ),
      okText: t("common.button.confirm"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const resp = await removeWorkflow(workflow);
          if (resp) {
            setTableData((prev) => prev.filter((item) => item.id !== workflow.id));
            refreshData();
          }
        } catch (err) {
          console.error(err);
          notification.error({ message: t("common.text.request_error"), description: getErrMsg(err) });
        }
      },
    });
  };

  return (
    <div className="px-6 py-4">
      <div className="mx-auto max-w-320">
        <h1>{t("workflow.page.title")}</h1>
        <p className="text-base text-gray-500">{t("workflow.page.subtitle")}</p>

        <div className="flex items-center justify-between gap-x-2 gap-y-3 not-md:flex-col-reverse not-md:items-start not-md:justify-normal">
          <div className="flex w-full flex-1 items-center gap-x-2 md:max-w-200">
            <div>
              <Segmented
                options={[
                  { label: <span className="text-sm">{t("workflow.props.state.filter.all")}</span>, value: "" },
                  { label: <span className="text-sm">{t("workflow.props.state.filter.enabled")}</span>, value: "enabled" },
                  { label: <span className="text-sm">{t("workflow.props.state.filter.disabled")}</span>, value: "disabled" },
                ]}
                size="large"
                value={(filters["state"] as string) || ""}
                onChange={(value) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, state: value }));
                }}
              />
            </div>
            <div className="flex-1">
              <Input.Search
                className="text-sm placeholder:text-sm"
                allowClear
                defaultValue={filters["keyword"] as string}
                placeholder={t("workflow.search.placeholder")}
                size="large"
                onSearch={handleSearch}
              />
            </div>
            <div>
              <Button icon={<IconReload size="1.25em" />} size="large" onClick={handleReloadClick} />
            </div>
          </div>
          <div>
            <Button className="text-sm" icon={<IconPlus size="1.25em" />} size="large" type="primary" onClick={handleCreateClick}>
              {t("workflow.action.create.button")}
            </Button>
          </div>
        </div>

        <Table<WorkflowModel>
          className="mt-4"
          columns={tableColumns}
          dataSource={tableData}
          loading={loading}
          locale={{
            emptyText: loading ? (
              <Skeleton />
            ) : (
              <Empty
                title={t("workflow.nodata.title")}
                description={getErrMsg(loadedError ?? t("workflow.nodata.description"))}
                icon={<IconHierarchy3 size={24} />}
                extra={
                  loadedError ? (
                    <Button icon={<IconReload size="1.25em" />} type="primary" onClick={handleReloadClick}>
                      {t("common.button.reload")}
                    </Button>
                  ) : (
                    <Button icon={<IconCirclePlus size="1.25em" />} type="primary" onClick={handleCreateClick}>
                      {t("workflow.nodata.button")}
                    </Button>
                  )
                }
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: tableTotal,
            showSizeChanger: true,
            onChange: (page: number, pageSize: number) => {
              setPage(page);
              setPageSize(pageSize);
            },
            onShowSizeChange: (page: number, pageSize: number) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
          rowClassName="cursor-pointer"
          rowKey={(record) => record.id}
          scroll={{ x: "max(100%, 960px)" }}
          onChange={(_, __, sorter) => {
            setSorter(Array.isArray(sorter) ? sorter[0] : sorter);
          }}
          onRow={(record) => ({
            onClick: () => {
              handleRecordDetailClick(record);
            },
          })}
        />
      </div>
    </div>
  );
};

export default WorkflowList;
