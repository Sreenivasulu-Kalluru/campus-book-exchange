import { useUIStore } from '../../store/uiStore';
import Modal from './Modal';

const BookPreviewModal = () => {
  const isBookPreviewModalOpen = useUIStore(
    (state) => state.isBookPreviewModalOpen
  );
  const closeBookPreviewModal = useUIStore(
    (state) => state.closeBookPreviewModal
  );
  const bookPreviewUrl = useUIStore((state) => state.bookPreviewUrl);

  const handleClose = () => {
    closeBookPreviewModal();
  };

  return (
    <Modal
      isOpen={isBookPreviewModalOpen}
      onClose={handleClose}
      title="Book Preview"
    >
      <div className="w-full h-[70vh]">
        {bookPreviewUrl ? (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(
              bookPreviewUrl
            )}&embedded=true`}
            className="w-full h-full border-none rounded-md"
            title="Book Preview"
          ></iframe>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            No preview available.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookPreviewModal;
