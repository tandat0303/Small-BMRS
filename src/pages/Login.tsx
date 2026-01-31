import { useState } from "react";
import logo from "../assets/logo-LY.jpg";
import vi from "../assets/vi.jpg";
import en from "../assets/en.jpg";
import tw from "../assets/tw.jpg";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Select, Input } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import { login } from "@/services/auth.api";
import { useNavigate } from "react-router-dom";
import storage from "@/lib/storage";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function Login() {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      cardNumber: "",
      password: "",
      factory: "",
    },
    validationSchema: Yup.object().shape({
      cardNumber: Yup.string().required(
        t("login.validate_empty.please_enter_id"),
      ),
      password: Yup.string().required(
        t("login.validate_empty.please_enter_pass"),
      ),
      factory: Yup.string().required(
        t("login.validate_empty.please_choose_fac"),
      ),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await login({
          userId: values.cardNumber,
          password: values.password,
          factory: values.factory,
        });

        const token = storage.get("accessToken");

        if (!token) {
          throw new Error("INVALID_CREDENTIALS");
        }

        Swal.fire({
          icon: "success",
          title: t("login.success"),
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 200);
        });
      } catch (error) {
        Swal.fire({
          title: t("login.error.title"),
          text: t("login.error.text"),
          icon: "error",
          confirmButtonText: t("login.error.confirm_btn_txt"),
          confirmButtonColor: "#ff0000",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col md:flex-row">
          {/* Logo Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-8 md:p-12 flex items-center justify-center md:w-2/5">
            <div className="text-center">
              <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:scale-105">
                <img
                  src={logo}
                  alt="logo"
                  className="w-full h-auto max-w-xs mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12 md:w-3/5">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {t("login.login")}
            </h2>
            <p className="text-gray-600 text-sm mb-6 sm:mb-8">
              {t("login.please_enter_info")}
            </p>

            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-5 sm:space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    {t("login.id")}
                  </label>
                  <Input
                    name="cardNumber"
                    value={formik.values.cardNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("login.enter_id")}
                    style={{ height: 45 }}
                    size="large"
                    status={
                      formik.errors.cardNumber && formik.touched.cardNumber
                        ? "error"
                        : ""
                    }
                  />
                  {formik.errors.cardNumber && formik.touched.cardNumber && (
                    <div className="text-red-600 text-xs mt-1 animate-slideDown">
                      {formik.errors.cardNumber}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    {t("login.password")}
                  </label>
                  <div className="relative">
                    <Input.Password
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t("login.enter_password")}
                      size="large"
                      style={{ height: 45 }}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      status={
                        formik.errors.password && formik.touched.password
                          ? "error"
                          : ""
                      }
                    />
                  </div>
                  {formik.errors.password && formik.touched.password && (
                    <div className="text-red-600 text-xs mt-1 animate-slideDown">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                {/* Factory */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    {t("login.factory")}
                  </label>

                  <Select
                    placeholder={t("login.choose_factory")}
                    value={formik.values.factory || undefined}
                    onChange={(value) => formik.setFieldValue("factory", value)}
                    onBlur={() => formik.setFieldTouched("factory", true)}
                    className="custom-ant-select w-full"
                    style={{ height: 45 }}
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

                  {formik.errors.factory && formik.touched.factory && (
                    <div className="text-red-600 text-xs mt-1 animate-slideDown">
                      {formik.errors.factory}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("login.logging_in")}
                    </span>
                  ) : (
                    t("login.login")
                  )}
                </button>

                {/* Language Selector */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {t("login.language")}
                  </label>

                  <Select
                    value={i18n.language}
                    onChange={(lng) => {
                      i18n.changeLanguage(lng);
                    }}
                    className="w-full sm:w-48"
                    options={[
                      {
                        value: "vi",
                        label: (
                          <div className="flex items-center gap-2">
                            <img src={vi} className="w-5 h-5" />
                            {t("login.vietnamese")}
                          </div>
                        ),
                      },
                      {
                        value: "en",
                        label: (
                          <div className="flex items-center gap-2">
                            <img src={en} className="w-5 h-5" />
                            {t("login.english")}
                          </div>
                        ),
                      },
                      {
                        value: "tw",
                        label: (
                          <div className="flex items-center gap-2">
                            <img src={tw} className="w-5 h-5" />
                            {t("login.taiwan")}
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
