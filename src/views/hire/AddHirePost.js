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
import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import CKedtiorCustom from '../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function AddHirePost() {
  const navigate = useNavigate()
  const [editorData, setEditorData] = useState('')
  const [dataHireCategory, setDataHireCategory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const initialValues = {
    title: '',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    salary: 'Thỏa thuận',
    address: 'TP. Hồ Chí Minh',
    exp: 'Không yêu cầu kinh nghiệm',
    level: 'Nhân viên',
    quantity: '1',
    work_mode: 'Toàn thời gian cố định',
    required_degree: 'Cao đẳng / Đại học',
    friendlyUrl: '',
    metaKeyword: '',
    metaDesc: '',
    hire_cate: '',
    visible: 1,
  }

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

  const slugify = (str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const fetchHireCategory = async () => {
    try {
      const response = await axiosClient.get('admin/hire-category')
      const data = response.data.data
      setDataHireCategory(data || [])
    } catch (error) {
      console.error('Fetch hire category error', error)
    }
  }

  useEffect(() => {
    fetchHireCategory()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/hire-post', {
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
        toast.success('Thêm bài đăng tuyển dụng thành công!')
        navigate('/hire/post')
      } else if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      } else {
        toast.error('Có lỗi xảy ra khi tạo bài đăng!')
      }
    } catch (error) {
      console.error('Post hire post error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
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
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-uppercase text-dark m-0">THÊM MỚI BÀI ĐĂNG TUYỂN DỤNG</h3>
          <p className="text-muted text-xs m-0 mt-1">
            Tạo bài tuyển dụng mới với đầy đủ thông tin chi tiết, yêu cầu ứng tuyển và cấu hình SEO
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
      >
        {({ setFieldValue, values }) => {
          return (
            <Form>
              <CRow className="g-4">
                <CCol md={8}>
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
                              placeholder="Ví dụ: Chuyên viên Thiết kế Đồ họa Senior (Thu nhập 15-20 triệu)"
                              onChange={(e) => {
                                field.onChange(e)
                                setFieldValue('friendlyUrl', slugify(e.target.value))
                              }}
                            />
                          )}
                        </Field>
                        <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                          Tên vị trí riêng sẽ hiển thị công khai trên website tuyển dụng.
                        </div>
                        <ErrorMessage
                          name="title"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                    </div>
                  </div>

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

                        <CCol md={6}>
                          <label className="form-label text-muted small fw-semibold mb-1">
                            Cấp bậc vị trí <span className="text-danger">*</span>
                          </label>
                          <Field
                            name="level"
                            type="text"
                            as={CFormInput}
                            placeholder="Ví dụ: Nhân viên / Chuyên viên / Trưởng phòng"
                          />
                          <ErrorMessage
                            name="level"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </CCol>

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
                        <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                          Phiên bản tên không dấu dùng cho URL website.
                        </div>
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
                              src={`${imageBaseUrl}${selectedFile}`}
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
                          <CSpinner size="sm" className="me-2" /> Đang tạo bài viết...
                        </>
                      ) : (
                        'Đăng bài tuyển dụng'
                      )}
                    </CButton>
                    <Link to="/hire/post" className="btn btn-outline-secondary w-100 btn-sm">
                      Hủy bỏ
                    </Link>
                  </div>
                </CCol>
              </CRow>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default AddHirePost
