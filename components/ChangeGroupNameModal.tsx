import React from "react";
import { Modal, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";

interface ChangeGroupNameModalProps {
  open: boolean;
  currentName: string;
  onSubmit: (newName: string) => void;
  onClose: () => void;
}

const ChangeGroupNameModal: React.FC<ChangeGroupNameModalProps> = ({
  open,
  currentName,
  onSubmit,
  onClose,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.name.trim());
    } catch (_) {
      /* validation error – ignore */
    }
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <EditOutlined /> Change Group Name
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Accept"
      cancelText="Cancel"
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" initialValues={{ name: currentName }}>
        <Form.Item
          name="name"
          label="New Group Name"
          rules={[
            { required: true, message: "Group name cannot be blank" },
            { max: 50, message: "Group name limit is 50 characters" },
          ]}
        >
          <Input placeholder="Type a new name" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeGroupNameModal;
