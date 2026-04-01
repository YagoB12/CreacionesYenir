
import Modal from "../../components/Modal/Modal";
import type { User } from "../../types/user.types";
import EditUserForm from "./editUserForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
};

const EditUserModal: React.FC<Props> = ({ isOpen, onClose, user, onSuccess }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <EditUserForm
        user={user}
        onClose={onClose}
        onSuccess={() => {
          onSuccess();
          onClose();
        } } isOpen={isOpen}      />
    </Modal>
  );
};

export default EditUserModal;
