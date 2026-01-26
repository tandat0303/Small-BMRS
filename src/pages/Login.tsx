import { useState } from "react";
import logo from "../assets/logo-LY.jpg";
import vn from "../assets/vietnam.png";
import en from "../assets/united-kingdom.png";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import { login } from "@/services/auth.api";
import { useNavigate } from "react-router-dom";
import storage from "@/lib/storage";

export default function Login() {
  const formik = useFormik({
    initialValues: {
      cardNumber: "",
      password: "",
      factory: ""
    },
    validationSchema: Yup.object().shape({
      cardNumber: Yup.string().required("Vui lòng nhập mã thẻ của bạn!"),
      password: Yup.string().required("Mật khẩu không được để trống!"),
      factory: Yup.string().required("Vui lòng chọn nhà máy!")
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

        navigate("/", { replace: true });
      } catch (error) {
        Swal.fire({
          title: "Đăng nhập thất bại!",
          text: "Sai tài khoản/mật khẩu hoặc nhà máy",
          icon: "error",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#ff0000",
        });
      } finally {
        setLoading(false);
      }
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("vi");
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
                <img src={logo} alt="logo" className="w-full h-auto max-w-xs mx-auto" />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12 md:w-3/5">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
            <p className="text-gray-600 text-sm mb-6 sm:mb-8">Vui lòng nhập thông tin của bạn</p>
            
            <form onSubmit={formik.handleSubmit}> 
              <div className="space-y-5 sm:space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <span className="text-red-500 mr-1">*</span>
                    Số thẻ
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formik.values.cardNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Nhập số thẻ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Nhập mật khẩu"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
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
                    Nhà máy
                  </label>
                  <select
                    value={formik.values.factory}
                    name="factory"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white cursor-pointer"
                  >
                    <option value="">Chọn nhà máy</option>
                    <option value="LYV">LYV</option>
                    <option value="LHG">LHG</option>
                    <option value="JAZ">JAZ</option>
                    <option value="LTB">LTB</option>
                    <option value="JZS">JZS</option>
                    <option value="LVL">LVL</option>
                    <option value="LYM/POL">LYM/POL</option>
                  </select>
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>

                {/* Language Selector */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Ngôn ngữ
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="item-aligned"
                      side="bottom"
                      className="mt-1"
                    >
                      <SelectItem value="vi">
                        <div className="flex items-center gap-2">
                          <img src={vn} className="w-5 h-5" alt="Vietnamese" />
                          Tiếng Việt
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <img src={en} className="w-5 h-5" alt="English" />
                          English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}