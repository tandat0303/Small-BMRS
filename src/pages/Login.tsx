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

export default function LoginInterface() {
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
          text: "Sai tài khoản hoặc mật khẩu",
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full mx-4">
        <div className="flex flex-col md:flex-row">
          <div className="bg-white p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-100 h-128 bg-white flex items-center justify-center mb-6 mx-auto">
                <img src={logo} alt="logo" />
              </div>
            </div>
          </div>

          <div className="p-12 md:w-3/5">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Đăng nhập</h2>
            <form onSubmit={formik.handleSubmit}> 
              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="text-red-600 text-xs mt-1">
                    {formik.errors.cardNumber && formik.touched.cardNumber ?
                      formik.errors.cardNumber : null
                    }
                  </div>
                </div>

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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <div className="text-red-600 text-xs mt-1">
                      {formik.errors.password && formik.touched.password ?
                        formik.errors.password : null
                      }
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
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

                  <div className="text-red-600 text-xs mt-1">
                    {formik.errors.factory && formik.touched.factory ?
                      formik.errors.factory : null
                    }
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }
                  `}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Ngôn ngữ
                  </label>

                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                      position="item-aligned"
                      side="bottom"
                      className="mt-1"
                    >
                      <SelectItem value="vi">
                        <div className="flex items-center gap-2">
                          <img src={vn} className="w-5 h-5" />
                          Tiếng Việt
                        </div>
                      </SelectItem>

                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <img src={en} className="w-5 h-5" />
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
