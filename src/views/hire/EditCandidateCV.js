import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import moment from 'moment'
import { toast } from 'react-toastify'
import Loading from '../../components/loading/Loading'
import DeletedModal from '../../components/deletedModal/DeletedModal'

function EditCandidateCV() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [candidateData, setCandidateData] = useState(null)
  const [visibleDelete, setVisibleDelete] = useState(false)

  const fetchDataById = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`admin/detail-candidates/${id}`)
      if (response.data.status === true && response.data.data) {
        setCandidateData(response.data.data)
      } else {
        toast.error('Không tìm thấy thông tin ứng viên!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch candidate detail error', error)
      toast.error('Lỗi khi tải chi tiết hồ sơ ứng viên!')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDataById()
  }, [fetchDataById])

  const formatCandidateDate = (dateVal) => {
    if (!dateVal) return 'Chưa cập nhật'
    if (typeof dateVal === 'number' || (!isNaN(dateVal) && String(dateVal).length <= 11)) {
      return moment.unix(Number(dateVal)).format('DD/MM/YYYY, HH:mm:ss')
    }
    return moment(dateVal).isValid()
      ? moment(dateVal).format('DD/MM/YYYY, HH:mm:ss')
      : String(dateVal)
  }

  const apiUploadBaseUrl = 'https://api-nk.vitinhnguyenkim.vn/'

  const getRawFileUrl = (filePath) => {
    if (!filePath) return null
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
    const cleanPath = filePath.replace(/^\/+/, '')
    if (cleanPath.startsWith('uploads/candidate/')) {
      return `${apiUploadBaseUrl}${cleanPath}`
    }
    return `${imageBaseUrl}${cleanPath}`
  }

  const getViewableFileUrl = (filePath) => {
    const rawUrl = getRawFileUrl(filePath)
    if (!rawUrl) return null
    const ext = rawUrl.split('.').pop()?.toLowerCase()
    if (ext === 'doc' || ext === 'docx') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}`
    }
    return rawUrl
  }

  const handleDownloadFile = (filePath) => {
    if (!filePath) {
      toast.warn('Không có tệp tin để tải về!')
      return
    }
    const directUrl = getRawFileUrl(filePath)
    if (directUrl) {
      const link = document.createElement('a')
      link.href = directUrl
      link.target = '_blank'
      link.setAttribute('download', filePath.split('/').pop() || 'file')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Đang bắt đầu tải tệp xuống!')
    } else {
      toast.error('Không tìm thấy đường dẫn tệp!')
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      const response = await axiosClient.delete(`admin/candidates/${id}`)
      if (response.data.status === true) {
        toast.success('Xóa hồ sơ ứng viên thành công!')
        navigate('/hire/candidate-cv')
      } else {
        toast.error('Xóa thất bại!')
      }
    } catch (error) {
      console.error('Delete error', error)
      toast.error('Đã xảy ra lỗi khi xóa!')
    }
  }

  const cvUrl = getViewableFileUrl(candidateData?.cv)
  const fileInfoUrl = getViewableFileUrl(candidateData?.fileInfo)

  return (
    <div className="pb-4">
      {!isPermissionCheck ? (
        <div className="card shadow-sm p-4 text-center">
          <h5 className="text-danger fw-bold mb-2">
            Bạn không đủ quyền để truy cập trang quản trị này.
          </h5>
          <p className="text-muted">
            Vui lòng quay lại{' '}
            <Link to={'/dashboard'} className="fw-bold text-primary">
              Bảng điều khiển
            </Link>
          </p>
        </div>
      ) : (
        <>
          <DeletedModal
            visible={visibleDelete}
            setVisible={setVisibleDelete}
            onDelete={handleDelete}
          />

          {/* PAGE HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold text-uppercase text-dark m-0">CHI TIẾT HỒ SƠ ỨNG VIÊN</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Xem thông tin liên hệ, vị trí ứng tuyển và tải tệp hồ sơ CV
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/hire/candidate-cv">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh sách hồ sơ (CV)
                </CButton>
              </Link>
              <Link to="/hire/post">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý bài đăng
                </CButton>
              </Link>
              <CButton
                color="danger"
                size="sm"
                className="fw-semibold text-white shadow-xs"
                onClick={() => setVisibleDelete(true)}
              >
                Xóa hồ sơ này
              </CButton>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 text-center bg-white rounded-3 shadow-sm">
              <Loading />
            </div>
          ) : !candidateData ? (
            <div className="card border-0 shadow-sm p-5 text-center">
              <h5 className="text-muted fw-bold">Không tìm thấy thông tin hồ sơ ứng viên</h5>
              <div className="mt-3">
                <Link to="/hire/candidate-cv" className="btn btn-primary btn-sm fw-bold">
                  Quay lại danh sách
                </Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {/* LEFT COLUMN: CANDIDATE INFORMATION */}
              <div className="col-12 col-lg-7">
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white h-100">
                  <div className="card-header bg-light border-bottom py-3">
                    <h6
                      className="fw-bold text-dark m-0 text-uppercase"
                      style={{ fontSize: '13px' }}
                    >
                      Thông tin cá nhân ứng viên
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-12">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Họ và tên ứng viên
                        </label>
                        <div className="form-control bg-light border-0 fw-bold text-dark py-2">
                          {candidateData.name || 'Chưa cung cấp'}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Thư điện tử (Email)
                        </label>
                        <div className="form-control bg-light border-0 py-2">
                          {candidateData.gmail ? (
                            <a
                              href={`mailto:${candidateData.gmail}`}
                              className="text-primary fw-semibold text-decoration-none"
                            >
                              {candidateData.gmail}
                            </a>
                          ) : (
                            <span className="text-muted">Chưa cung cấp</span>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Số điện thoại
                        </label>
                        <div className="form-control bg-light border-0 py-2">
                          {candidateData.phone ? (
                            <a
                              href={`tel:${candidateData.phone}`}
                              className="text-dark fw-bold text-decoration-none"
                            >
                              {candidateData.phone}
                            </a>
                          ) : (
                            <span className="text-muted">Chưa cung cấp</span>
                          )}
                        </div>
                      </div>

                      {/* Job Position */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Vị trí ứng tuyển
                        </label>
                        <div className="form-control bg-light border-0 py-2">
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 fw-bold">
                            {candidateData.titlePost ||
                              candidateData.hire_post?.name ||
                              'Không xác định'}
                          </span>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Danh mục / Ban
                        </label>
                        <div className="form-control bg-light border-0 py-2">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1">
                            {candidateData.titleCategory ||
                              candidateData.hire_post?.hire_category?.title ||
                              'Chưa phân loại'}
                          </span>
                        </div>
                      </div>

                      {/* Submission Date */}
                      <div className="col-12">
                        <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                          Ngày nộp hồ sơ
                        </label>
                        <div className="form-control bg-light border-0 text-secondary py-2">
                          {formatCandidateDate(candidateData.date_post || candidateData.created_at)}
                        </div>
                      </div>

                      {/* Message / Introduction Letter */}
                      {candidateData.message && (
                        <div className="col-12">
                          <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                            Thư giới thiệu / Lời nhắn
                          </label>
                          <div
                            className="form-control bg-light border-0 p-3 text-dark"
                            style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}
                          >
                            {candidateData.message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ATTACHMENTS & CV FILES */}
              <div className="col-12 col-lg-5">
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white h-100">
                  <div className="card-header bg-light border-bottom py-3">
                    <h6
                      className="fw-bold text-dark m-0 text-uppercase"
                      style={{ fontSize: '13px' }}
                    >
                      Tệp đính kèm & Hồ sơ CV
                    </h6>
                  </div>
                  <div className="card-body p-4 d-flex flex-column gap-4">
                    {/* CV FILE CARD */}
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                          Tệp CV ứng viên
                        </div>
                        {candidateData.cv ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5">
                            Có tệp đính kèm
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-0.5">
                            Không có tệp
                          </span>
                        )}
                      </div>

                      {candidateData.cv ? (
                        <div>
                          <div
                            className="text-muted small text-truncate mb-3"
                            title={candidateData.cv}
                          >
                            {candidateData.cv}
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {cvUrl && (
                              <a
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary fw-semibold px-3 shadow-xs"
                              >
                                Xem trực tiếp CV
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary fw-semibold px-3"
                              onClick={() =>
                                handleDownloadFile(candidateData.cv, candidateData.name, 'CV')
                              }
                            >
                              Tải về máy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted small m-0">
                          Ứng viên này không tải lên tệp CV đính kèm.
                        </p>
                      )}
                    </div>

                    {/* ADDITIONAL INFO FILE CARD */}
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                          Phiếu thông tin ứng tuyển
                        </div>
                        {candidateData.fileInfo ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5">
                            Có tệp đính kèm
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-0.5">
                            Không có tệp
                          </span>
                        )}
                      </div>

                      {candidateData.fileInfo ? (
                        <div>
                          <div
                            className="text-muted small text-truncate mb-3"
                            title={candidateData.fileInfo}
                          >
                            {candidateData.fileInfo}
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {fileInfoUrl && (
                              <a
                                href={fileInfoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary fw-semibold px-3 shadow-xs"
                              >
                                Xem trực tiếp
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary fw-semibold px-3"
                              onClick={() =>
                                handleDownloadFile(
                                  candidateData.fileInfo,
                                  candidateData.name,
                                  'Phieu_Thong_Tin',
                                )
                              }
                            >
                              Tải về máy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted small m-0">
                          Không có phiếu thông tin ứng tuyển kèm theo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EditCandidateCV
