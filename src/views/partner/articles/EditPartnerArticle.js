import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient_NK } from '../../../axiosConfig'
import { onFilesChange, revokeObjectURLs } from '../../../helper/fileUpload'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'

function EditPartnerArticle() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [partnerCategories, setPartnerCategories] = useState([])

  const [imagePreview, setImagePreview] = useState([])
  const [imageBase64, setImageBase64] = useState([])

  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    shortDesc: '',
    url: '',
    pageTitle: '',
    metaDesc: '',
    metaKey: '',
    categories: [],
    visible: '1',
  })

  const validationSchema = Yup.object({
    title: Yup.string().required('Vui lòng nhập tiêu đề'),
    shortDesc: Yup.string().required('Vui lòng nhập mô tả ngắn'),
    url: Yup.string()
      .matches(/^[a-z0-9-]+$/, 'Chuỗi dẫn tĩnh chỉ bao gồm chữ thường, số và dấu gạch ngang (-)')
      .required('Vui lòng nhập chuỗi đường dẫn'),
    pageTitle: Yup.string()
      .max(60, 'Tiêu đề trang tối đa 60 ký tự')
      .required('Vui lòng nhập tiêu đề trang'),
    metaKey: Yup.string()
      .min(20, 'Meta keywords tối thiểu 20 ký tự')
      .max(150, 'Meta keywords tối đa 150 ký tự')
      .matches(/,/g, 'Meta keywords phải có ít nhất 1 dấu phẩy (,)'),
    metaDesc: Yup.string()
      .min(50, 'Meta description tối thiểu 50 ký tự')
      .max(200, 'Meta description tối đa 200 ký tự')
      .required('Vui lòng nhập mô tả meta'),
    categories: Yup.array().min(1, 'Vui lòng chọn ít nhất 1 danh mục'),
    visible: Yup.string().required('Vui lòng chọn trạng thái hiển thị'),
  })

  // Lấy id từ url
  const search = window.location.search
  const params = new URLSearchParams(search)
  const id = params.get('id')

  // Fetch partner categories
  useEffect(() => {
    const controller = new AbortController()
    const fetchPartners = async () => {
      try {
        const res = await axiosClient_NK.get(`/admin/get-partner`, {
          signal: controller.signal,
        })
        if (res.data.status === 'success') {
          const list = res?.data?.partner || []
          setPartnerCategories(list)
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Fetch partners categories error', err)
        }
      }
    }
    fetchPartners()
    return () => {
      controller.abort()
      revokeObjectURLs(imagePreview)
    }
  }, [])

  // Fetch partner article by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient_NK.get(`/admin/partner-article/${id}/edit`)
        if (res.data.status === true && res.data.data) {
          const d = res.data.data
          setInitialValues({
            title: d.title || '',
            description: d.description || '',
            shortDesc: d.short_description || '',
            url: d.url || '',
            pageTitle: d.page_title || '',
            metaDesc: d.meta_description || '',
            metaKey: d.meta_keywords || '',
            categories: d.partner_ids || [],
            visible: d.visible ? String(d.visible) : '1',
          })
          if (typeof d.images === 'string' && d.images) {
            setImagePreview([d.images])
          }
        }
      } catch (err) {
        console.error('Fetch partner article by id error', err)
      }
    }
    if (id) fetchData()
  }, [id])

  const handleImageChange = (e) => {
    onFilesChange(e, {
      multiple: true,
      setUrls: setImagePreview,
      previousUrls: imagePreview,
      setBase64: setImageBase64,
      onError: (err) => {
        console.error('Image upload error:', err)
        toast.error('Lỗi khi đọc ảnh')
      },
    })
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (!imageBase64 || imageBase64.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ảnh')
      return
    }

    const payload = {
      title: values.title,
      description: values.description,
      short_description: values.shortDesc,
      url: values.url,
      page_title: values.pageTitle,
      meta_description: values.metaDesc,
      meta_keywords: values.metaKey,
      partner_ids: values.categories,
      visible: values.visible,
      images: imageBase64,
    }

    try {
      setIsLoading(true)
      const response = await axiosClient_NK.post('/admin/partner-article', payload)
      if (response.data.status === true) {
        toast.success('Lưu bài đăng thành công')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
      resetForm()
      revokeObjectURLs(imagePreview)
      setImagePreview([])
      setImageBase64([])
      navigate('/partner/articles')
    } catch (err) {
      console.error('Submit error', err)
      toast.error('Đã xảy ra lỗi khi lưu bài đăng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h3>CẬP NHẬT BÀI VIẾT ĐỐI TÁC</h3>
        </CCol>

        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/partner/articles'}>
              <CButton color="primary" type="button" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <CRow>
              {/* Right: Nội dung */}
              <CCol md={9}>
                <CCol md={12} className="mb-2">
                  <label htmlFor="title">Tiêu đề</label>
                  <Field name="title" as={CFormInput} id="title" innerRef={inputRef} />
                  <ErrorMessage name="title" component="div" className="text-danger" />
                </CCol>

                <CCol md={12} className="mb-2">
                  <label>Nội dung bài viết</label>
                  <CKedtiorCustom
                    data={values.description}
                    onChangeData={(data) => setFieldValue('description', data)}
                  />
                  <ErrorMessage name="description" component="div" className="text-danger" />
                </CCol>

                <CCol md={12} className="mb-2">
                  <label>Mô tả ngắn</label>
                  <Field name="shortDesc">
                    {({ field }) => <CFormTextarea {...field} rows={3} id="shortDesc" />}
                  </Field>
                </CCol>

                <div className="p-3 border bg-white mt-3 rounded">
                  <h5>Search Engine Optimize</h5>
                  <CCol md={12} className="mb-2">
                    <label>Chuỗi đường dẫn</label>

                    <Field
                      name="url"
                      as={CFormInput}
                      text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chuỗi này bao gồm chữ cái thường, số và dấu gạch ngang (-)."
                    />
                    <ErrorMessage name="url" component="div" className="text-danger" />
                  </CCol>

                  <CCol md={12} className="mb-2">
                    <label>Tiêu đề trang</label>
                    <Field
                      name="pageTitle"
                      as={CFormInput}
                      text="Độ dài của tiêu đề trang tối đa 60 ký tự."
                    />
                    <ErrorMessage name="pageTitle" component="div" className="text-danger" />
                  </CCol>

                  <CCol md={12} className="mb-2">
                    <label>Meta keywords</label>
                    <Field
                      name="metaKey"
                      as={CFormInput}
                      text="Độ dài của meta keywords chuẩn là từ 100 đến 150 ký tự, trong đó có ít nhất 4 dấu phẩy (,)."
                    />
                    <ErrorMessage name="metaKey" component="div" className="text-danger" />
                  </CCol>

                  <CCol md={12} className="mb-2">
                    <label>Meta description</label>
                    <Field
                      name="metaDesc"
                      as={CFormInput}
                      text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                    />
                    <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                  </CCol>
                </div>
                <br />
              </CCol>

              {/* Left: Danh mục, Ảnh, Hiển thị */}
              <CCol md={3}>
                <CCol md={12} className="mb-3">
                  <label>Danh mục (chọn đối tác)</label>
                  <div
                    style={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      border: '1px solid #eee',
                      borderRadius: 6,
                      padding: 8,
                      background: '#fafbfc',
                    }}
                  >
                    {Array.isArray(partnerCategories) && partnerCategories.length > 0 ? (
                      partnerCategories.map((p) => (
                        <label
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 8,
                            fontSize: 15,
                            cursor: 'pointer',
                            gap: 8,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={values.categories.includes(p.id)}
                            onChange={(e) => {
                              const checked = e.target.checked
                              const next = checked
                                ? [...values.categories, p.id]
                                : values.categories.filter((id) => id !== p.id)
                              setFieldValue('categories', next)
                            }}
                            style={{
                              marginRight: 8,
                              transform: 'scale(1.5)',
                              cursor: 'pointer',
                            }}
                          />
                          {p.namePartner}
                        </label>
                      ))
                    ) : (
                      <div>Không có danh mục</div>
                    )}
                  </div>
                  <ErrorMessage name="categories" component="div" className="text-danger" />
                </CCol>

                <CCol md={12} className="mb-3">
                  <label>Ảnh đại diện</label>
                  <CFormInput type="file" accept="image/*" multiple onChange={handleImageChange} />
                  <div className="mt-2 d-flex flex-wrap">
                    {imagePreview.map((src, idx) => (
                      <div key={idx} style={{ marginRight: 8, marginBottom: 8 }}>
                        <CImage src={src} width={200} className="border" />
                      </div>
                    ))}
                  </div>
                </CCol>

                <CCol md={12} className="mb-3">
                  <label>Hiển thị</label>
                  <Field name="visible" as={CFormSelect}>
                    <option value="1">Có</option>
                    <option value="0">Không</option>
                  </Field>
                </CCol>

                <CCol xs={12} className="mt-3">
                  <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" /> Đang lưu...
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </CButton>
                </CCol>
              </CCol>
            </CRow>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default EditPartnerArticle
