import { useState } from "react";
import logo from "../assets/logo-LY.jpg";
import vi from "../assets/vi.jpg";
import en from "../assets/en.jpg";
import tw from "../assets/tw.jpg";
import { Form, Input, Select, Button } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import { authAPI } from "@/services/auth.api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/components/ui/Notification";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [form] = Form.useForm();

  const Lang = ({ img, text }: any) => (
    <div className="flex items-center gap-2">
      <img src={img} className="w-5 h-5" />
      {text}
    </div>
  );

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const res = await authAPI.login({
        userId: values.cardNumber.trim(),
        password: values.password,
        factory: values.factory,
      });

      if (!res?.accessToken || !res?.user) {
        throw new Error("INVALID_CREDENTIALS");
      }

      if (res?.authenticated !== false) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      login(res.user, res.accessToken);

      // message.success(t("login.success"));
      navigate("/", { replace: true });
    } catch (error: any) {
      if (
        error?.response?.status === 401 ||
        error.message === "INVALID_CREDENTIALS"
      ) {
        form.setFields([
          {
            name: "password",
            errors: [t("login.error.text")],
          },
        ]);
      } else if (isAuthenticated === false) {
        notify("error", t("login.error.title"), t("login.error.text"), 1.5);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full">
        <div className="flex flex-col md:flex-row">
          {/* Logo */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-10 md:w-2/5 flex items-center justify-center">
            <img src={logo} className="max-w-xs w-full" />
          </div>

          {/* Form */}
          <div className="p-8 md:p-12 md:w-3/5">
            <h2 className="text-3xl font-bold mb-2">{t("login.login")}</h2>
            <p className="text-gray-600 mb-8">{t("login.please_enter_info")}</p>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              autoComplete="off"
            >
              {/* ID */}
              <Form.Item
                label={
                  <>
                    <span className="text-red-500 mr-1">*</span> {t("login.id")}
                  </>
                }
                name="cardNumber"
                normalize={(value) => value?.trim()}
                rules={[
                  {
                    required: true,
                    message: t("login.validate_empty.please_enter_id"),
                  },
                  {
                    whitespace: true,
                    message: t("login.validate_empty.please_enter_id"),
                  },
                ]}
              >
                <Input size="large" placeholder={t("login.enter_id")} />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label={
                  <>
                    <span className="text-red-500 mr-1">*</span>{" "}
                    {t("login.password")}
                  </>
                }
                name="password"
                rules={[
                  {
                    required: true,
                    message: t("login.validate_empty.please_enter_pass"),
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={t("login.enter_password")}
                  iconRender={(v) =>
                    v ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              {/* Factory */}
              <Form.Item
                label={
                  <>
                    <span className="text-red-500 mr-1">*</span>{" "}
                    {t("login.factory")}
                  </>
                }
                name="factory"
                rules={[
                  {
                    required: true,
                    message: t("login.validate_empty.please_choose_fac"),
                  },
                ]}
              >
                <Select
                  placeholder={t("login.choose_factory")}
                  size="large"
                  options={[
                    { value: "LYV", label: "LYV" },
                    { value: "LHG", label: "LHG" },
                    { value: "JAZ", label: "JAZ" },
                    { value: "LTB", label: "LTB" },
                    { value: "JZS", label: "JZS" },
                    { value: "LVL", label: "LVL" },
                    { value: "LYM/POL", label: "LYM/POL" },
                  ]}
                />
              </Form.Item>

              {/* Submit */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{ marginTop: 12 }}
                >
                  {t("login.login")}
                </Button>
              </Form.Item>

              {/* Language */}
              <Form.Item label={t("login.language")}>
                <div className="w-full sm:w-48">
                  <Select
                    value={i18n.language}
                    onChange={(lng) => i18n.changeLanguage(lng)}
                    options={[
                      {
                        value: "vi",
                        label: <Lang img={vi} text={t("login.vietnamese")} />,
                      },
                      {
                        value: "en",
                        label: <Lang img={en} text={t("login.english")} />,
                      },
                      {
                        value: "tw",
                        label: <Lang img={tw} text={t("login.taiwan")} />,
                      },
                    ]}
                  />
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
