"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Space,
  Spin,
} from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pageReady, setPageReady] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSendCode = async () => {
    try {
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');

      setSendingCode(true);
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        messageApi.success('Verification code sent, please check your email');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        messageApi.error(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Send code error:', error);
      messageApi.error('Please enter a valid email address');
    } finally {
      setSendingCode(false);
    }
  };

  const handleLogin = async (values: { email: string; code: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        messageApi.success('Login successful');
        Cookies.set('auth_token', data.token, { expires: 30 });
        router.push('/');
      } else {
        messageApi.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      messageApi.error('Login error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageReady(true);
  }, []);

  return (
    <>
      {!pageReady ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%'
        }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          {contextHolder}
          <Card title="Login System" className="w-96">
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                rules={[
                  { required: true, message: 'Please enter verification code' },
                  { len: 6, message: 'Verification code must be 6 digits' }
                ]}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="6-digit verification code"
                    size="large"
                  />
                  <Button
                    type="primary"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || sendingCode}
                    loading={sendingCode}
                    size="large"
                  >
                    {countdown > 0 ? `Retry in ${countdown}s` : 'Send Code'}
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full"
                  icon={<LoginOutlined />}
                  loading={loading}
                  size="large"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;
