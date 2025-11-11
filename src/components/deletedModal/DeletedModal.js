import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'

import '../css/deletedModal.css'

const DeletedModal = ({ onDelete, visible, setVisible }) => {
  const handleConfirmDelete = () => {
    onDelete()
    setVisible(false)
  }
  return (
    <>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="LiveDemoExampleLabel"
        className="delete-modal__dialog"
      >
        <CModalHeader className="deleted-modal__header" onClose={() => setVisible(false)}>
          <CModalTitle id="LiveDemoExampleLabel">
            <div className="d-flex align-items-center " style={{ columnGap: 4 }}>
              <CIcon icon={cilCheckCircle} className="text-success" size="lg" />
              <span>XÁC NHẬN XÓA</span>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="deleted-modal__body">
          <p>Thông tin này sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn chắc chứ?</p>
        </CModalBody>
        <CModalFooter className="deleted-modal__footer">
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton onClick={handleConfirmDelete} color="danger">
            Xác nhận
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default DeletedModal
