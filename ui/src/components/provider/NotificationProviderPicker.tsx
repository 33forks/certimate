﻿import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMount } from "ahooks";
import { Avatar, Card, Divider, Empty, Input, type InputRef, Tooltip, Typography } from "antd";

import Show from "@/components/Show";
import { type NotificationProvider, notificationProvidersMap } from "@/domain/provider";
import { mergeCls } from "@/utils/css";

import { type SharedPickerProps, usePickerDataSource, usePickerWrapperCols } from "./_shared";

export interface NotificationProviderPickerProps extends SharedPickerProps<NotificationProvider> {
  showAvailable?: boolean;
}

const NotificationProviderPicker = ({
  className,
  style,
  autoFocus,
  gap = "middle",
  placeholder,
  showAvailable = true,
  showSearch = true,
  onFilter,
  onSelect,
}: NotificationProviderPickerProps) => {
  const { t } = useTranslation();

  const { wrapperElRef, cols } = usePickerWrapperCols(320);

  const [keyword, setKeyword] = useState<string>();
  const keywordInputRef = useRef<InputRef>(null);
  useMount(() => {
    if (autoFocus) {
      setTimeout(() => keywordInputRef.current?.focus(), 1);
    }
  });

  const dataSources = usePickerDataSource({
    dataSource: Array.from(notificationProvidersMap.values()),
    keyword: keyword,
    onFilter: onFilter,
  });

  const renderOption = (provider: NotificationProvider) => {
    return (
      <div key={provider.type}>
        <Card
          className="h-16 w-full overflow-hidden shadow"
          styles={{ body: { height: "100%", padding: "0.5rem 1rem" } }}
          hoverable
          onClick={() => {
            handleProviderTypeSelect(provider.type);
          }}
        >
          <div className="flex size-full items-center gap-4 overflow-hidden">
            <Avatar className="bg-stone-100" icon={<img src={provider.icon} />} shape="square" size={28} />
            <div className="flex-1 overflow-hidden">
              <div className="line-clamp-2 max-w-full">
                <Tooltip title={t(provider.name)} mouseEnterDelay={1}>
                  <Typography.Text>{t(provider.name) || "\u00A0"}</Typography.Text>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const handleProviderTypeSelect = (value: string) => {
    onSelect?.(value);
  };

  return (
    <div className={className} style={style} ref={wrapperElRef}>
      <Show when={showSearch}>
        <div className="mb-4">
          <Input.Search ref={keywordInputRef} placeholder={placeholder ?? t("common.text.search")} onChange={(e) => setKeyword(e.target.value.trim())} />
        </div>
      </Show>

      <Show when={dataSources.filtered.length > 0} fallback={<Empty description={t("provider.text.nodata")} image={Empty.PRESENTED_IMAGE_SIMPLE} />}>
        <div
          className={mergeCls("grid w-full gap-2", `grid-cols-${cols}`, {
            "gap-4": gap === "large",
            "gap-2": gap === "middle",
            "gap-1": gap === "small",
            [`gap-${+gap || "2"}`]: typeof gap === "number",
          })}
        >
          {(showAvailable ? dataSources.available : dataSources.filtered).map((provider) => renderOption(provider))}
        </div>

        <Show when={showAvailable && dataSources.unavailable.length > 0}>
          <Divider size="small">
            <Typography.Text className="text-xs font-normal" type="secondary">
              {t("provider.text.unavailable_options")}
            </Typography.Text>
          </Divider>

          <div
            className={mergeCls("grid w-full gap-2", `grid-cols-${cols}`, {
              "gap-4": gap === "large",
              "gap-2": gap === "middle",
              "gap-1": gap === "small",
              [`gap-${+gap || "2"}`]: typeof gap === "number",
            })}
          >
            {dataSources.unavailable.map((provider) => renderOption(provider))}
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default NotificationProviderPicker;
