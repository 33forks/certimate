import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCard } from "@ant-design/pro-components";
import { App, Button, Form, Input, Skeleton, Typography } from "antd";
import { createSchemaFieldRule } from "antd-zod";
import { produce } from "immer";
import { z } from "zod";

import Show from "@/components/Show";
import Tips from "@/components/Tips";
import { type CAProviderType, CA_PROVIDERS } from "@/domain/provider";
import { SETTINGS_NAMES, type SSLProviderSettingsContent, type SettingsModel } from "@/domain/settings";
import { useAntdForm } from "@/hooks";
import { get as getSettings, save as saveSettings } from "@/repository/settings";
import { getErrMsg } from "@/utils/error";

const SSLProviderContext = createContext(
  {} as {
    pending: boolean;
    settings: SettingsModel<SSLProviderSettingsContent>;
    updateSettings: (settings: MaybeModelRecordWithId<SettingsModel<SSLProviderSettingsContent>>) => Promise<void>;
  }
);

const SSLProviderEditFormLetsEncryptConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const { form: formInst, formProps } = useAntdForm<NonNullable<unknown>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.LETSENCRYPT],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.LETSENCRYPT;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.LETSENCRYPT] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.LETSENCRYPT);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormLetsEncryptStagingConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const { form: formInst, formProps } = useAntdForm<NonNullable<unknown>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.LETSENCRYPTSTAGING],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.LETSENCRYPTSTAGING;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.LETSENCRYPTSTAGING] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.LETSENCRYPTSTAGING);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item>
        <Tips message={<span dangerouslySetInnerHTML={{ __html: t("settings.sslprovider.form.letsencryptstaging_alert") }}></span>} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormBuypassConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const { form: formInst, formProps } = useAntdForm<NonNullable<unknown>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.BUYPASS],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.BUYPASS;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.BUYPASS] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.LETSENCRYPTSTAGING);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormGoogleTrustServicesConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const formSchema = z.object({
    eabKid: z
      .string(t("access.form.googletrustservices_eab_kid.placeholder"))
      .min(1, t("access.form.googletrustservices_eab_kid.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
    eabHmacKey: z
      .string(t("access.form.googletrustservices_eab_hmac_key.placeholder"))
      .min(1, t("access.form.googletrustservices_eab_hmac_key.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const { form: formInst, formProps } = useAntdForm<z.infer<typeof formSchema>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.GOOGLETRUSTSERVICES],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.GOOGLETRUSTSERVICES;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.GOOGLETRUSTSERVICES] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.GOOGLETRUSTSERVICES);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item
        name="eabKid"
        label={t("access.form.googletrustservices_eab_kid.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.googletrustservices_eab_kid.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.googletrustservices_eab_kid.placeholder")} />
      </Form.Item>

      <Form.Item
        name="eabHmacKey"
        label={t("access.form.googletrustservices_eab_hmac_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.googletrustservices_eab_hmac_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.googletrustservices_eab_hmac_key.placeholder")} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormSSLComConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const formSchema = z.object({
    eabKid: z
      .string(t("access.form.sslcom_eab_kid.placeholder"))
      .min(1, t("access.form.sslcom_eab_kid.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
    eabHmacKey: z
      .string(t("access.form.sslcom_eab_hmac_key.placeholder"))
      .min(1, t("access.form.sslcom_eab_hmac_key.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const { form: formInst, formProps } = useAntdForm<z.infer<typeof formSchema>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.SSLCOM],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.SSLCOM;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.SSLCOM] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.SSLCOM);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item
        name="eabKid"
        label={t("access.form.sslcom_eab_kid.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.sslcom_eab_kid.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.sslcom_eab_kid.placeholder")} />
      </Form.Item>

      <Form.Item
        name="eabHmacKey"
        label={t("access.form.sslcom_eab_hmac_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.sslcom_eab_hmac_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.sslcom_eab_hmac_key.placeholder")} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormZeroSSLConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const formSchema = z.object({
    eabKid: z
      .string(t("access.form.zerossl_eab_kid.placeholder"))
      .min(1, t("access.form.zerossl_eab_kid.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
    eabHmacKey: z
      .string(t("access.form.zerossl_eab_hmac_key.placeholder"))
      .min(1, t("access.form.zerossl_eab_hmac_key.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const { form: formInst, formProps } = useAntdForm<z.infer<typeof formSchema>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.ZEROSSL],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.ZEROSSL;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.ZEROSSL] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.ZEROSSL);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item
        name="eabKid"
        label={t("access.form.zerossl_eab_kid.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.zerossl_eab_kid.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.zerossl_eab_kid.placeholder")} />
      </Form.Item>

      <Form.Item
        name="eabHmacKey"
        label={t("access.form.zerossl_eab_hmac_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.zerossl_eab_hmac_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.zerossl_eab_hmac_key.placeholder")} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SSLProviderEditFormACMECAConfig = () => {
  const { t } = useTranslation();

  const { pending, settings, updateSettings } = useContext(SSLProviderContext);

  const formSchema = z.object({
    endpoint: z.url(t("common.errmsg.url_invalid")),
    eabKid: z
      .string(t("access.form.acmeca_eab_kid.placeholder"))
      .min(1, t("access.form.acmeca_eab_kid.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
    eabHmacKey: z
      .string(t("access.form.acmeca_eab_hmac_key.placeholder"))
      .min(1, t("access.form.acmeca_eab_hmac_key.placeholder"))
      .max(256, t("common.errmsg.string_max", { max: 256 })),
  });
  const formRule = createSchemaFieldRule(formSchema);
  const { form: formInst, formProps } = useAntdForm<z.infer<typeof formSchema>>({
    initialValues: settings?.content?.config?.[CA_PROVIDERS.ACMECA],
    onSubmit: async (values) => {
      const newSettings = produce(settings, (draft) => {
        draft.content ??= {} as SSLProviderSettingsContent;
        draft.content.provider = CA_PROVIDERS.ACMECA;

        draft.content.config ??= {} as SSLProviderSettingsContent["config"];
        draft.content.config[CA_PROVIDERS.ACMECA] = values;
      });
      await updateSettings(newSettings);

      setFormChanged(false);
    },
  });

  const [formChanged, setFormChanged] = useState(false);
  useEffect(() => {
    setFormChanged(settings?.content?.provider !== CA_PROVIDERS.ACMECA);
  }, [settings?.content?.provider]);

  const handleFormChange = () => {
    setFormChanged(true);
  };

  return (
    <Form {...formProps} form={formInst} disabled={pending} layout="vertical" onValuesChange={handleFormChange}>
      <Form.Item
        name="endpoint"
        label={t("access.form.acmeca_endpoint.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.acmeca_endpoint.tooltip") }}></span>}
      >
        <Input placeholder={t("access.form.acmeca_endpoint.placeholder")} />
      </Form.Item>

      <Form.Item
        name="eabKid"
        label={t("access.form.zerossl_eab_kid.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.zerossl_eab_kid.tooltip") }}></span>}
      >
        <Input autoComplete="new-password" placeholder={t("access.form.zerossl_eab_kid.placeholder")} />
      </Form.Item>

      <Form.Item
        name="eabHmacKey"
        label={t("access.form.zerossl_eab_hmac_key.label")}
        rules={[formRule]}
        tooltip={<span dangerouslySetInnerHTML={{ __html: t("access.form.zerossl_eab_hmac_key.tooltip") }}></span>}
      >
        <Input.Password autoComplete="new-password" placeholder={t("access.form.zerossl_eab_hmac_key.placeholder")} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={!formChanged} loading={pending}>
          {t("common.button.save")}
        </Button>
      </Form.Item>
    </Form>
  );
};

const SettingsSSLProvider = () => {
  const { t } = useTranslation();

  const { message, notification } = App.useApp();

  const [formInst] = Form.useForm<{ provider?: string }>();
  const [formPending, setFormPending] = useState(false);

  const [settings, setSettings] = useState<SettingsModel<SSLProviderSettingsContent>>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const settings = await getSettings<SSLProviderSettingsContent>(SETTINGS_NAMES.SSL_PROVIDER);
      setSettings(settings);
      setProviderType(settings.content?.provider);

      setLoading(false);
    };

    fetchData();
  }, []);

  const [providerType, setProviderType] = useState<CAProviderType>(CA_PROVIDERS.LETSENCRYPT);
  const providerFormEl = useMemo(() => {
    switch (providerType) {
      case CA_PROVIDERS.LETSENCRYPT:
        return <SSLProviderEditFormLetsEncryptConfig />;
      case CA_PROVIDERS.LETSENCRYPTSTAGING:
        return <SSLProviderEditFormLetsEncryptStagingConfig />;
      case CA_PROVIDERS.BUYPASS:
        return <SSLProviderEditFormBuypassConfig />;
      case CA_PROVIDERS.GOOGLETRUSTSERVICES:
        return <SSLProviderEditFormGoogleTrustServicesConfig />;
      case CA_PROVIDERS.SSLCOM:
        return <SSLProviderEditFormSSLComConfig />;
      case CA_PROVIDERS.ZEROSSL:
        return <SSLProviderEditFormZeroSSLConfig />;
      case CA_PROVIDERS.ACMECA:
        return <SSLProviderEditFormACMECAConfig />;
    }
  }, [providerType]);

  const updateContextSettings = async (settings: MaybeModelRecordWithId<SettingsModel<SSLProviderSettingsContent>>) => {
    setFormPending(true);

    try {
      const resp = await saveSettings(settings);
      setSettings(resp);
      setProviderType(resp.content?.provider);

      message.success(t("common.text.operation_succeeded"));
    } catch (err) {
      notification.error({ message: t("common.text.request_error"), description: getErrMsg(err) });
    } finally {
      setFormPending(false);
    }
  };

  return (
    <SSLProviderContext.Provider
      value={{
        pending: formPending,
        settings: settings!,
        updateSettings: updateContextSettings,
      }}
    >
      <h2>{t("settings.sslprovider.ca.title")}</h2>
      <Show when={!loading} fallback={<Skeleton active />}>
        <Form form={formInst} disabled={formPending} layout="vertical" initialValues={{ provider: providerType }}>
          <div className="mb-2">
            <Typography.Text type="secondary">
              <span dangerouslySetInnerHTML={{ __html: t("settings.sslprovider.ca.tips") }}></span>
            </Typography.Text>
          </div>

          <Form.Item name="provider" label={t("settings.sslprovider.form.provider.label")}>
            <CheckCard.Group className="w-full" onChange={(value) => setProviderType(value as CAProviderType)}>
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/letsencrypt.svg"} className="size-8" />}
                size="small"
                title={t("provider.letsencrypt")}
                description="letsencrypt.org"
                value={CA_PROVIDERS.LETSENCRYPT}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/letsencrypt.svg"} className="size-8" />}
                size="small"
                title={t("provider.letsencryptstaging")}
                description="letsencrypt.org"
                value={CA_PROVIDERS.LETSENCRYPTSTAGING}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/buypass.png"} className="size-8" />}
                size="small"
                title={t("provider.buypass")}
                description="buypass.com"
                value={CA_PROVIDERS.BUYPASS}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/google.svg"} className="size-8" />}
                size="small"
                title={t("provider.googletrustservices")}
                description="pki.goog"
                value={CA_PROVIDERS.GOOGLETRUSTSERVICES}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/sslcom.svg"} className="size-8" />}
                size="small"
                title={t("provider.sslcom")}
                description="ssl.com"
                value={CA_PROVIDERS.SSLCOM}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/zerossl.svg"} className="size-8" />}
                size="small"
                title={t("provider.zerossl")}
                description="zerossl.com"
                value={CA_PROVIDERS.ZEROSSL}
              />
              <CheckCard
                style={{ width: 280 }}
                avatar={<img src={"/imgs/providers/acmeca.svg"} className="size-8" />}
                size="small"
                title={t("provider.acmeca")}
                description={"\u00A0"}
                value={CA_PROVIDERS.ACMECA}
              />
            </CheckCard.Group>
          </Form.Item>
        </Form>

        <div className="md:max-w-160">{providerFormEl}</div>
      </Show>
    </SSLProviderContext.Provider>
  );
};

export default SettingsSSLProvider;
