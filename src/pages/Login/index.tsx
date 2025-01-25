import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth } from "@/utils/firebase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // Simulate API call
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success('Login successful!')
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        message.error("No user found with this email. Please check or register.");
      } else if (err.code === "auth/wrong-password") {
        message.error("Incorrect password. Please try again.");
      } else {
        message.error(err.message);
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative backdrop-blur-sm bg-opacity-90">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Login to access your account</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            className="space-y-4"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Email"
                className="group transition-all duration-300 hover:border-purple-400 focus:border-purple-500 active:border-purple-600"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                className="group transition-all duration-300 hover:border-purple-400 focus:border-purple-500 active:border-purple-600"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                loading={loading}
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              to="/register"
              className="text-indigo-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

