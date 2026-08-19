import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft } from '@coreui/icons'

function AddPromotionNews() {
  const navigate = useNavigate()
  const [editorData, setEditorData] = useState('')

  //loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    friendlyUrl: '',
    pageTitle: '',
    metaKeyword: '',
    metaDesc: '',
    startDate: new Date(),
    endDate: new Date(),
    visible: 1,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề bài viết là bắt buộc.'),
    startDate: Yup.date().required('Thời gian bắt đầu là bắt buộc.'),
    endDate: Yup.date()
      .required('Thời gian kết thúc là bắt buộc.')
      .test('is-greater', 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu!', function (value) {
        const { startDate } = this.parent
        return value && startDate ? value > startDate : true
      }),
  })

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/promotion', {
        title: values.title,
        description: editorData,
        friendly_url: values.friendlyUrl,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        selectedFile: selectedFile,
        date_start_promotion: values.startDate,
        date_end_promotion: values.endDate,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm tin khuyến mãi thành công!')
        navigate('/promotion')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data promotion news error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  //set img avatar
  function onFileChange(e) {
    const files = e.target.files
    const selectedFiles = []
    const fileUrls = []

    Array.from(files).forEach((file) => {
      fileUrls.push(URL.createObjectURL(file))
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
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
    <div>
      {/* Top Title & Actions */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">THÊM MỚI TIN KHUYẾN MÃI</h4>
          <p className="text-muted small mb-0">
            Tạo tin tức khuyến mãi mới để hiển thị trên website
          </p>
        </div>
        <div>
          <CButton
            color="secondary"
            variant="outline"
            className="fw-semibold d-flex align-items-center gap-1 shadow-xs"
            onClick={() => navigate('/promotion')}
          >
            <CIcon icon={cilArrowLeft} /> Quay lại danh sách
          </CButton>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <CRow className="g-3">
              <CCol lg={8} md={12}>
                <CCard className="shadow-xs border mb-3">
                  <CCardHeader className="bg-white py-3 px-3 fw-bold text-primary">
                    Thông tin bài viết
                  </CCardHeader>
                  <CCardBody className="p-3">
                    <div className="mb-3">
                      <label htmlFor="title-input" className="form-label fw-semibold text-dark">
                        Tiêu đề bài viết <span className="text-danger">*</span>
                      </label>
                      <Field name="title">
                        {({ field }) => (
                          <CFormInput
                            {...field}
                            type="text"
                            id="title-input"
                            placeholder="Nhập tiêu đề tin khuyến mãi..."
                          />
                        )}
                      </Field>
                      <div className="form-text text-muted small">
                        Tên riêng sẽ hiển thị trên trang web của bạn.
                      </div>
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Nội dung bài viết</label>
                      <CKedtiorCustom
                        data={editorData}
                        onChangeData={(data) => setEditorData(data)}
                      />
                    </div>
                  </CCardBody>
                </CCard>

                <CCard className="shadow-xs border mb-3">
                  <CCardHeader className="bg-white py-3 px-3 fw-bold text-primary">
                    Cấu hình SEO (Search Engine Optimization)
                  </CCardHeader>
                  <CCardBody className="p-3">
                    <div className="mb-3">
                      <label htmlFor="url-input" className="form-label fw-semibold text-dark">
                        Chuỗi đường dẫn (Friendly URL)
                      </label>
                      <Field
                        name="friendlyUrl"
                        type="text"
                        as={CFormInput}
                        id="url-input"
                        placeholder="VD: thu-may-cu-doi-may-moi-cung-dell"
                      />
                      <div className="form-text text-muted small">
                        Phiên bản tên tĩnh của URL. Chứa chữ cái thường, số và dấu gạch ngang (-).
                      </div>
                      <ErrorMessage
                        name="friendlyUrl"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="pageTitle-input" className="form-label fw-semibold text-dark">
                        Tiêu đề trang (Meta Title)
                      </label>
                      <Field
                        name="pageTitle"
                        type="text"
                        as={CFormInput}
                        id="pageTitle-input"
                        placeholder="Tiêu đề hiển thị trên tab trình duyệt..."
                      />
                      <div className="form-text text-muted small">Tối đa 60 ký tự.</div>
                      <ErrorMessage
                        name="pageTitle"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="metaKeyword-input"
                        className="form-label fw-semibold text-dark"
                      >
                        Meta Keywords
                      </label>
                      <Field
                        name="metaKeyword"
                        type="text"
                        as={CFormInput}
                        id="metaKeyword-input"
                        placeholder="Từ khóa cách nhau bởi dấu phẩy..."
                      />
                      <div className="form-text text-muted small">
                        Độ dài chuẩn 100 đến 150 ký tự, gồm các từ khóa chính.
                      </div>
                      <ErrorMessage
                        name="metaKeyword"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="metaDesc-input" className="form-label fw-semibold text-dark">
                        Meta Description
                      </label>
                      <Field
                        name="metaDesc"
                        type="text"
                        as={CFormInput}
                        id="metaDesc-input"
                        placeholder="Mô tả tóm tắt nội dung khi tìm kiếm..."
                      />
                      <div className="form-text text-muted small">Tối đa 140-200 ký tự.</div>
                      <ErrorMessage
                        name="metaDesc"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol lg={4} md={12}>
                <CCard className="shadow-xs border mb-3">
                  <CCardHeader className="bg-white py-3 px-3 fw-bold text-primary">
                    Ảnh đại diện & Thời gian
                  </CCardHeader>
                  <CCardBody className="p-3">
                    <div className="mb-3">
                      <label htmlFor="formFile" className="form-label fw-semibold text-dark">
                        Ảnh đại diện
                      </label>
                      <CFormInput
                        type="file"
                        id="formFile"
                        size="sm"
                        onChange={(e) => onFileChange(e)}
                      />
                      <div className="mt-2 text-center">
                        {file.length > 0 ? (
                          file.map((item, index) => (
                            <CImage
                              className="border rounded p-1 shadow-xs"
                              key={index}
                              src={item}
                              style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'cover' }}
                            />
                          ))
                        ) : (
                          <div className="p-3 border rounded text-muted bg-light small">
                            Chưa chọn ảnh
                          </div>
                        )}
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark d-block">
                        Thời gian áp dụng từ <span className="text-danger">*</span>
                      </label>
                      <DatePicker
                        className="form-control form-control-sm mb-2"
                        dateFormat={'dd-MM-yyyy'}
                        showIcon
                        selected={values.startDate}
                        onChange={(date) => setFieldValue('startDate', date)}
                      />
                      <ErrorMessage
                        name="startDate"
                        component="div"
                        className="text-danger small mb-2"
                      />

                      <label className="form-label fw-semibold text-dark d-block">
                        đến ngày <span className="text-danger">*</span>
                      </label>
                      <DatePicker
                        className="form-control form-control-sm mb-2"
                        dateFormat={'dd-MM-yyyy'}
                        showIcon
                        selected={values.endDate}
                        onChange={(date) => setFieldValue('endDate', date)}
                      />
                      <ErrorMessage
                        name="endDate"
                        component="div"
                        className="text-danger small mb-2"
                      />
                    </div>

                    <hr />

                    <div className="mb-3">
                      <label htmlFor="visible-select" className="form-label fw-semibold text-dark">
                        Trạng thái hiển thị
                      </label>
                      <Field
                        name="visible"
                        as={CFormSelect}
                        id="visible-select"
                        options={[
                          { label: 'Có', value: '1' },
                          { label: 'Không', value: '0' },
                        ]}
                      />
                    </div>

                    <CButton
                      color="primary"
                      type="submit"
                      className="w-100 fw-semibold mt-2 shadow-xs"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" className="me-1" /> Đang thêm mới...
                        </>
                      ) : (
                        'Thêm mới tin khuyến mãi'
                      )}
                    </CButton>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default AddPromotionNews
