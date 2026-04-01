import Modal from "../../components/Modal/Modal";
import type { ProductFromApi } from "../../types/product.type";
import EditProductForm from "./editProductForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductFromApi | null;
  onSuccess: () => void;
};

const EditProductModal: React.FC<Props> = ({ isOpen, onClose, product, onSuccess }) => {
  if (!product) return null;

  return (
  <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto">
    <EditProductForm
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      onSuccess={() => {
        onSuccess();
        onClose();
      }}
    />
  </Modal>
);

};

export default EditProductModal;
