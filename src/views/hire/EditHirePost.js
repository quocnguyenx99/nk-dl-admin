import {
  CButton,
  CCol,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CKedtiorCustom from '../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'
import Loading from '../../components/loading/Loading'

function EditHirePost() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [editorData, setEditorData] = useState('')
  const [dataHireCategory, setDataHireCategory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const [initialValues, setInitialValues] = useState({
    title: '',
    startDate: new Date(),
    salary: '',
    address: '',
    exp: '',
    level: '',
    quantity: '',
    work_mode: '',
    required_degree: '',
    friendlyUrl: '',
    metaKeyword: '',
    metaDesc: '',
    hire_cate: '',
    visible: 1,
  })

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề bài đăng là bắt buộc.'),
    startDate: Yup.date().required('Ngày hết hạn là bắt buộc.'),
    salary: Yup.string().required('Mức lương là bắt buộc.'),
    address: Yup.string().required('Địa chỉ làm việc là bắt buộc.'),
    exp: Yup.string().required('Kinh nghiệm yêu cầu là bắt buộc.'),
    level: Yup.string().required('Cấp bậc vị trí là bắt buộc.'),
    quantity: Yup.string().required('Số lượng tuyển dụng là bắt buộc.'),
    work_mode: Yup.string().required('Hình thức làm việc là bắt buộc.'),
    required_degree: Yup.string().required('Bằng cấp là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn (slug) là bắt buộc.'),
    metaKeyword: Yup.string(),
    metaDesc: Yup.string(),
    visible: Yup.number().oneOf([0, 1], 'Trạng thái không hợp lệ.'),
  })

  const fetchHireCategory = async () => {
    try {
      const response = await axiosClient.get('admin/hire-category')
      const data = response.data.data
      setDataHireCategory(data || [])
    } catch (error) {
      console.error('Fetch hire category error', error)
    }
  }

  const parseDeadlineDate = (deadlineVal) => {
    if (!deadlineVal) return new Date()
    if (
      typeof deadlineVal === 'number' ||
      (!isNaN(deadlineVal) && String(deadlineVal).length <= 11)
    ) {
      return moment.unix(Number(deadlineVal)).toDate()
    }
    const d = new Date(deadlineVal)
    return isNaN(d.getTime()) ? new Date() : d
  }

  const fetchDataById = useCallback(async () => {
    if (!id) {
      setIsFetchingData(false)
      return
    }
    try {
      setIsFetchingData(true)
      const response = await axiosClient.get(`admin/hire-post/${id}/edit`)
      const data = response.data.data
      if (data && response.data.status === true) {
        setInitialValues({
          title: data?.name || '',
          startDate: parseDeadlineDate(data?.deadline),
          salary: data?.salary || '',
          address: data?.address || '',
          exp: data?.experience || '',
          level: data?.rank || '',
          quantity: data?.number || '',
          work_mode: data?.form || '',
          required_degree: data?.degree || '',
          friendlyUrl: data?.slug || '',
          metaKeyword: data?.meta_keywords || '',
          metaDesc: data?.meta_description || '',
          hire_cate: data?.hire_cate_id ? String(data.hire_cate_id) : '',
          visible: data?.display !== undefined ? Number(data?.display) : 1,
        })
        setSelectedFile(data?.image || '')
        setEditorData(data?.information || '')
      } else {
        toast.error('Không tìm thấy dữ liệu bài đăng!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch hire post detail error', error)
      toast.error('Lỗi khi tải chi tiết bài tuyển dụng!')
    } finally {
      setIsFetchingData(false)
    }
  }, [id])

  useEffect(() => {
    fetchHireCategory()
    fetchDataById()
  }, [fetchDataById])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/hire-post/${id}`, {
        name: values.title,
        deadline: values.startDate,
        salary: values.salary,
        address: values.address,
        experience: values.exp,
        rank: values.level,
        number: values.quantity,
        form: values.work_mode,
        information: editorData,
        degree: values.required_degree,
        slug: values.friendlyUrl,
        meta_keywords: values.metaKeyword,
        meta_description: values.metaDesc,
        image: selectedFile,
        hire_cate_id: values.hire_cate,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật bài đăng tuyển dụng thành công!')
        navigate('/hire/post')
      } else if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      } else {
        toast.error('Cập nhật thất bại!')
      }
    } catch (error) {
      console.error('Update hire post error', error)
      toast.error('Đã xảy ra lỗi khi lưu bài viết!')
    } finally {
      setIsLoading(false)
    }
  }

  function onFileChange(e) {
    const files = e.target.files
    const selectedFiles = []
    const fileUrls = []

    Array.from(files).forEach((fileItem) => {
      fileUrls.push(URL.createObjectURL(fileItem))
      const fileReader = new FileReader()
      fileReader.readAsDataURL(fileItem)

      fileReader.onload = (event) => {
        selectedFiles.push(event.target.result)
        if (selectedFiles.length === files.length) {
          setSelectedFile(selectedFiles)
        }
      }
    })

    setFile(fileUrls)
  }

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
          {/* PAGE HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold text-uppercase text-dark m-0">
                CHỈNH SỬA BÀI ĐĂNG TUYỂN DỤNG
              </h3>
              <p className="text-muted text-xs m-0 mt-1">
                Cập nhật thông tin chi tiết, hình thức làm việc và cấu hình SEO cho bài viết tuyển
                dụng
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/hire/post">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý bài đăng tuyển dụng
                </CButton>
              </Link>
              <Link to="/hire/candidate-cv">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Hồ sơ ứng tuyển (CV)
                </CButton>
              </Link>
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ setFieldValue, values }) => {
              return (
                <Form>
                  {isFetchingData ? (
                    <div className="p-5 text-center bg-white rounded-3 shadow-sm">
                      <Loading />
                    </div>
                  ) : (
                    <CRow className="g-4">
                      {/* LEFT COLUMN: MAIN CONTENT */}
                      <CCol md={8}>
                        {/* BASIC INFO CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Thông tin vị trí tuyển dụng
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold mb-1">
                                Tiêu đề tuyển dụng <span className="text-danger">*</span>
                              </label>
                              <Field name="title">
                                {({ field }) => (
                                  <CFormInput
                                    {...field}
                                    type="text"
                                    placeholder="Ví dụ: Chuyên viên Thiết kế Đồ họa Senior"
                                  />
                                )}
                              </Field>
                              <ErrorMessage
                                name="title"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* RECRUITMENT REQUIREMENTS CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Yêu cầu tuyển dụng chung
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            <CRow className="g-3">
                              {/* Deadline DatePicker */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1 d-block">
                                  Hạn nộp hồ sơ <span className="text-danger">*</span>
                                </label>
                                <DatePicker
                                  dateFormat="dd/MM/yyyy"
                                  showIcon
                                  className="form-control w-100"
                                  selected={values.startDate}
                                  onChange={(date) => setFieldValue('startDate', date)}
                                />
                                <ErrorMessage
                                  name="startDate"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Salary */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Mức lương <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="salary"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: 12 - 18 Triệu hoặc Thỏa thuận"
                                />
                                <ErrorMessage
                                  name="salary"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Location */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Địa điểm làm việc <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="address"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                                />
                                <ErrorMessage
                                  name="address"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Experience */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Kinh nghiệm yêu cầu <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="exp"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: 1-2 năm kinh nghiệm"
                                />
                                <ErrorMessage
                                  name="exp"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Rank / Level */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Cấp bậc vị trí <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="level"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: Nhân viên / Chuyên viên"
                                />
                                <ErrorMessage
                                  name="level"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Quantity */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Số lượng cần tuyển <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="quantity"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: 02 người"
                                />
                                <ErrorMessage
                                  name="quantity"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Degree */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Bằng cấp yêu cầu <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="required_degree"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: Cao đẳng / Đại học"
                                />
                                <ErrorMessage
                                  name="required_degree"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>

                              {/* Work mode */}
                              <CCol md={6}>
                                <label className="form-label text-muted small fw-semibold mb-1">
                                  Hình thức làm việc <span className="text-danger">*</span>
                                </label>
                                <Field
                                  name="work_mode"
                                  type="text"
                                  as={CFormInput}
                                  placeholder="Ví dụ: Toàn thời gian cố định"
                                />
                                <ErrorMessage
                                  name="work_mode"
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </CCol>
                            </CRow>
                          </div>
                        </div>

                        {/* JOB DESCRIPTION CKEDITOR CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Chi tiết mô tả & Yêu cầu công việc
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            <CKedtiorCustom
                              data={editorData}
                              onChangeData={(data) => setEditorData(data)}
                            />
                          </div>
                        </div>

                        {/* SEO CONFIG CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Tối ưu hóa tìm kiếm (SEO)
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold mb-1">
                                Chuỗi đường dẫn (Slug URL) <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="friendlyUrl"
                                type="text"
                                as={CFormInput}
                                placeholder="chuyen-vien-thiet-ke-do-hoa"
                              />
                              <ErrorMessage
                                name="friendlyUrl"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label text-muted small fw-semibold mb-1">
                                Meta Keywords
                              </label>
                              <Field
                                name="metaKeyword"
                                as={CFormTextarea}
                                rows={2}
                                placeholder="tuyen dung, nguyen kim, thiet ke do hoa, viec lam hcm"
                              />
                            </div>

                            <div className="mb-0">
                              <label className="form-label text-muted small fw-semibold mb-1">
                                Meta Description
                              </label>
                              <Field
                                name="metaDesc"
                                as={CFormTextarea}
                                rows={3}
                                placeholder="Mô tả ngắn gọn về vị trí tuyển dụng hiển thị trên Google..."
                              />
                            </div>
                          </div>
                        </div>
                      </CCol>

                      {/* RIGHT COLUMN: SIDEBAR SETTINGS */}
                      <CCol md={4}>
                        {/* CATEGORY SELECT CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Danh mục tuyển dụng
                            </h6>
                          </div>
                          <div className="card-body p-3">
                            <Field name="hire_cate" as={CFormSelect}>
                              <option value="">-- Chọn danh mục vị trí --</option>
                              {dataHireCategory?.map((cate) => (
                                <option key={cate.id} value={cate.id}>
                                  {cate.title}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="hire_cate"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>
                        </div>

                        {/* THUMBNAIL / AVATAR CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Ảnh minh họa bài viết
                            </h6>
                          </div>
                          <div className="card-body p-3">
                            <CFormInput
                              name="avatar"
                              type="file"
                              id="formFile"
                              size="sm"
                              onChange={(e) => onFileChange(e)}
                            />
                            <div className="mt-3 text-center bg-light p-2 rounded border">
                              {file.length === 0 ? (
                                selectedFile ? (
                                  <CImage
                                    className="rounded border img-fluid"
                                    src={
                                      selectedFile.startsWith('data:')
                                        ? selectedFile
                                        : `${imageBaseUrl}${selectedFile}`
                                    }
                                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <span className="text-muted small">Chưa chọn ảnh minh họa</span>
                                )
                              ) : (
                                file.map((item, index) => (
                                  <CImage
                                    className="rounded border img-fluid"
                                    key={index}
                                    src={item}
                                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* VISIBILITY CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                          <div className="card-header bg-light border-bottom py-3">
                            <h6
                              className="fw-bold text-dark m-0 text-uppercase"
                              style={{ fontSize: '13px' }}
                            >
                              Trạng thái hiển thị
                            </h6>
                          </div>
                          <div className="card-body p-3">
                            <Field name="visible" as={CFormSelect}>
                              <option value={1}>Có (Hiển thị ngay)</option>
                              <option value={0}>Không (Tạm ẩn)</option>
                            </Field>
                          </div>
                        </div>

                        {/* SUBMIT BUTTON CARD */}
                        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white p-3">
                          <CButton
                            color="primary"
                            type="submit"
                            className="w-100 fw-bold shadow-xs py-2 mb-2"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> Đang lưu thay đổi...
                              </>
                            ) : (
                              'Lưu thay đổi bài đăng'
                            )}
                          </CButton>
                          <Link to="/hire/post" className="btn btn-outline-secondary w-100 btn-sm">
                            Hủy bỏ
                          </Link>
                        </div>
                      </CCol>
                    </CRow>
                  )}
                </Form>
              )
            }}
          </Formik>
        </>
      )}
    </div>
  )
}

export default EditHirePost
