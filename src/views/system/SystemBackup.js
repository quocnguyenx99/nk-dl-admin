import React, { useState } from 'react'
import {
  CButton,
  CForm,
  CCol,
  CRow,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CContainer,
} from '@coreui/react'
import './css/systemBackup.css'

const SystemBackup = () => {
  const [selectedTables, setSelectedTables] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  const handleTableSelection = (e) => {
    const { options } = e.target
    const selected = []
    for (const option of options) {
      if (option.selected) {
        selected.push(option.value)
      }
    }
    setSelectedTables(selected)
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleBackup = () => {
    if (selectedTables.length === 0) {
      alert('Chọn bảng dữ liệu trước khi sao lưu!')
      return
    }
    // Xử lý sao lưu bảng đã chọn
    console.log('Backing up tables:', selectedTables)
  }

  const handleRestore = () => {
    if (!selectedFile) {
      alert('Chọn file trước khi phục hồi!')
      return
    }
    // Xử lý phục hồi file đã chọn
    console.log('Restoring from file:', selectedFile)
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h2>BACKUP DỮ LIỆU</h2>
        </CCol>
      </CRow>
      <CForm className="backup-restore-form">
        <CRow className="mb-4">
          <CCol md={12}>
            <h5>Sao lưu từng bảng dữ liệu</h5>
            <div>
              <em className="orange-txt">
                Sao lưu dữ liệu. Chọn bảng dữ liệu được cập nhật. Bắt buộc các bảng phải được chọn
                trước.
              </em>
            </div>
            <CFormLabel htmlFor="tableSelect" className="custom-label">
              Chọn bảng dữ liệu
            </CFormLabel>
            <CFormSelect
              multiple
              size="10"
              height={100}
              aria-label="multiple select"
              id="tableSelect"
              onChange={handleTableSelection}
              className="custom-select"
            >
              <option value="about">about</option>
              <option value="about_desc">about_desc</option>
              <option value="ad_pos">ad_pos</option>
              <option value="admin">admin</option>
              <option value="admin_group">admin_group</option>
              <option value="admin_menu">admin_menu</option>
              <option value="admin_permission">admin_permission</option>
              <option value="admin_sessions">admin_sessions</option>
              <option value="admin_logs">admin_logs</option>
              <option value="advertise">advertise</option>
              {/* Các bảng dữ liệu khác */}
            </CFormSelect>
            <div className="mt-3">
              <CButton size="sm" color="primary" onClick={handleBackup} className="custom-button">
                Backup
              </CButton>
            </div>
          </CCol>
        </CRow>

        <hr />

        <CRow>
          <CCol md={12}>
            <h5>Phục hồi dữ liệu</h5>
            <CFormLabel htmlFor="fileInput" className="custom-label">
              File (.sql, .gz):
            </CFormLabel>
            <CFormInput
              size="sm"
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".sql,.gz"
              className="custom-file-input"
            />
            <div className="mt-3">
              <CButton size="sm" color="primary" onClick={handleRestore} className="custom-button">
                Import
              </CButton>
            </div>
          </CCol>
        </CRow>
      </CForm>
    </div>
  )
}

export default SystemBackup
