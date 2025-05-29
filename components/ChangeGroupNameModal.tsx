"use client"
import React from "react";
import { Modal, Form, Input } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation("common")
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
          <EditOutlined /> {t("Change Group Name")}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText={t("Accept")}
      cancelText={t("Cancel")}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" initialValues={{ name: currentName }}>
        <Form.Item
          name="name"
          label={t("New Group Name")}
          rules={[
            { required: true, message: (t("Group name cannot be blank")) },
            { max: 50, message: (t("Group name limit is 50 characters")) },
          ]}
        >
          <Input placeholder={t("Type a new name")} maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeGroupNameModal;
