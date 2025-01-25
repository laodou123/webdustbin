import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/Card"
import { App, Avatar, Button, Form, Input, Modal } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { auth } from "@/utils/firebase"
import { useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'

export default function UserProfile() {
  const user = auth.currentUser;

  const navigate = useNavigate();

  const { message } = App.useApp();

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Redirect to login if no user is logged in
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        await signOut(auth);
        message.success("Logged out successfully");
        navigate("/login"); // Redirect to login page
      } catch (err: any) {
        console.error("Logout Error:", err);
        message.error("Failed to log out. Please try again.");
      }
    }
  };

  const confirmModal = async (values) => {
    if (!user) {
      return;
    }
    await updateProfile(user, values);
    message.success("Profile updated successfully");
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-md hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-evenly gap-4">
            <div className="flex flex-col items-center justify-center">
              <Avatar size={128} icon={<UserOutlined />} />
            </div>
            <div className="flex flex-col gap-3 text-base">
              <SingleInfoLile
                label='Display Name'
                value={user?.displayName}
              />
              <SingleInfoLile
                label='Email'
                value={user?.email}
              />
              <SingleInfoLile
                label='User Id'
                value={user?.uid}
              />
              <SingleInfoLile
                label='Account Created'
                value={user?.metadata.creationTime || "N/A"}
              />
              <SingleInfoLile
                label='Last Sign-In'
                value={user?.metadata.lastSignInTime}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => setIsEditing(true)}
            type='primary'
            size='large'
          >
            Update Display Name
          </Button>
          <Button
            onClick={handleLogout}
            danger
            type='primary'
            size='large'
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
      <UpdateModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        record={user}
        onConfim={confirmModal}
      />
    </div>
  )
}

const SingleInfoLile = ({label, value}) => {
  return (
    <div className="flex md:items-center flex-col md:flex-row">
      <span className="inline-block font-semibold w-[160px]">{label}:</span>
      <span className="flex-1">{value}</span>
    </div>
  );
};

const UpdateModal = ({ open, onClose, onConfim, record }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const confirmModal = async () => {
    try {
      setLoading(true);
      const res = await form.validateFields();
      if (onConfim) {
        await onConfim(res);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (record && open) {
      form.setFieldsValue({
        displayName: record.displayName,
      });
    }
  }, [form, record, open]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      title='Update Display Name'
      open={open}
      onCancel={onClose}
      maskClosable={false}
      centered
      width={400}
      onOk={confirmModal}
      okButtonProps={{
        loading
      }}
    >
      <Form
        form={form}
        layout='vertical'
      >
        <Form.Item
          label='Display Name'
          name='displayName'
          rules={[
            {
              required: true,
              message: 'Please input your display name!',
            },
          ]}
        >
          <Input placeholder='Please input your display name!' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

