import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
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
import { Link } from 'react-router-dom'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import { toast } from 'react-toastify'

function AddNews() {
  const [editorData, setEditorData] = useState('')
  const [dataNewsCategory, setDataNewsCategroy] = useState([])
  const [selectedCateCheckbox, setSelectedCateCheckbox] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    desc: '',
    friendlyUrl: '',
    pageTitle: '',
    metaKeyword: '',
    metaDesc: '',
    visible: 0,
    categories: [],
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Vui lòng nhập tiêu đề'),
    // desc: không bắt buộc
    friendlyUrl: Yup.string()
      .matches(/^[a-z0-9-]+$/, 'Chuỗi dẫn tĩnh chỉ bao gồm chữ thường, số và dấu gạch ngang (-)')
      .required('Vui lòng nhập chuỗi đường dẫn'),
    pageTitle: Yup.string()
      .max(60, 'Tiêu đề trang tối đa 60 ký tự')
      .required('Vui lòng nhập tiêu đề trang'),
    metaKeyword: Yup.string()
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

  const fetchDataNewsCategory = async () => {
    try {
      const response = await axiosClient.get(`admin/news-category`)
      if (response.data.status === true) {
        setDataNewsCategroy(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data news is error', error)
    }
  }

  useEffect(() => {
    fetchDataNewsCategory()
  }, [])

  const handleSubmit = async (values) => {
    if (!values.categories || values.categories.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 danh mục')
      return
    }
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/news', {
        title: values.title,
        description: editorData,
        short: values.desc,
        friendly_url: values.friendlyUrl,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        cat_id: values.categories,
        picture: selectedFile,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm tin tức thành công!')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data news is error', error)
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
      // Create a URL for the file
      fileUrls.push(URL.createObjectURL(file))

      // Read the file as base64
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = (event) => {
        selectedFiles.push(event.target.result)
        // Set base64 data after all files have been read
        if (selectedFiles.length === files.length) {
          setSelectedFile(selectedFiles)
        }
      }
    })

    // Set file URLs for immediate preview
    setFile(fileUrls)
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h3>THÊM MỚI TIN TỨC</h3>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/news'}>
              <CButton color="primary" type="button" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={12}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, setValues, values }) => {
              // Đồng bộ selectedCateCheckbox với values.categories
              const handleCategoryChange = (catId, checked) => {
                let next = []
                if (checked) {
                  next = [...values.categories, catId]
                } else {
                  next = values.categories.filter((id) => id !== catId)
                }
                setFieldValue('categories', next)
              }
              return (
                <Form>
                  <CRow>
                    <CCol md={8}>
                      <CCol md={12}>
                        <label htmlFor="title-input">Tiêu đề </label>
                        <Field name="title">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              text="Tên riêng sẽ hiển thị lên trang web của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Nội dung bài viết</label>
                        <CKedtiorCustom
                          data={editorData}
                          onChangeData={(data) => setEditorData(data)}
                        />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả ngắn</label>
                        <Field
                          name="desc"
                          type="text"
                          as={CFormTextarea}
                          id="desc-input"
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="desc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <h6>Search Engine Optimization</h6>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="url-input">Chuỗi đường dẫn</label>
                        <Field
                          name="friendlyUrl"
                          type="text"
                          as={CFormInput}
                          id="url-input"
                          text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chỉ bao gồm chữ cái thường, số và dấu gạch ngang (-). VD: vi-tinh-nguyen-kim-to-chuc-su-kien-tri-an-dip-20-nam-thanh-lap"
                        />
                        <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="pageTitle-input">Tiêu đề trang</label>
                        <Field
                          name="pageTitle"
                          type="text"
                          as={CFormInput}
                          id="pageTitle-input"
                          text="Tiêu đề trang tối đa 60 ký tự."
                        />
                        <ErrorMessage name="pageTitle" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="metaKeyword-input">Meta keywords</label>
                        <Field
                          name="metaKeyword"
                          type="text"
                          as={CFormTextarea}
                          id="metaKeyword-input"
                          text="Meta keywords từ 20-150 ký tự, có ít nhất 1 dấu phẩy (,) để phân tách từ khóa."
                        />
                        <ErrorMessage name="metaKeyword" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="metaDesc-input">Meta description</label>
                        <Field
                          name="metaDesc"
                          type="text"
                          as={CFormTextarea}
                          id="metaDesc-input"
                          text="Meta description nên dài khoảng 140 ký tự, tối đa 200 ký tự."
                        />
                        <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                      </CCol>
                      <br />
                    </CCol>

                    <CCol md={4}>
                      <CCol
                        md={12}
                        className="border bg-white p-2 overflow-scroll"
                        style={{ height: 'auto', maxHeight: 400 }}
                      >
                        <label
                          className="pb-2 mb-2 w-100"
                          style={{
                            fontWeight: 500,
                            fontSize: 16,
                            borderBottom: '1px solid #ddd',
                          }}
                          htmlFor="visible-input"
                        >
                          Danh mục bài viết <span className="text-danger">*</span>
                        </label>
                        {dataNewsCategory &&
                          dataNewsCategory?.length > 0 &&
                          dataNewsCategory.map((item) => (
                            <CFormCheck
                              style={{
                                transform: 'scale(1.4)',
                                accentColor: '#198754',
                              }}
                              key={item?.cat_id}
                              aria-label="Default select example"
                              id={`flexCheckDefault_${item?.cat_id}`}
                              value={item?.cat_id}
                              checked={values.categories.includes(item?.cat_id)}
                              label={item?.news_category_desc?.cat_name}
                              onChange={(e) => {
                                handleCategoryChange(item?.cat_id, e.target.checked)
                              }}
                            />
                          ))}
                      </CCol>
                      <ErrorMessage name="categories" component="div" className="text-danger" />
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="avatar"
                          type="file"
                          id="formFile"
                          label="Ảnh đại diện"
                          size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="avatar" component="div" className="text-danger" />

                        <div>
                          {file.length == 0 ? (
                            <div>
                              <CImage
                                className="border"
                                src={`${imageBaseUrl}${selectedFile}`}
                                width={200}
                              />
                            </div>
                          ) : (
                            file.map((item, index) => (
                              <CImage className="border" key={index} src={item} width={200} />
                            ))
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Hiển thị</label>
                        <Field
                          name="visible"
                          as={CFormSelect}
                          id="visible-select"
                          options={[
                            { label: 'Không', value: '0' },
                            { label: 'Có', value: '1' },
                          ]}
                        />
                        <ErrorMessage name="visible" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <CSpinner size="sm"></CSpinner> Đang cập nhật...
                            </>
                          ) : (
                            'Thêm mới'
                          )}
                        </CButton>
                      </CCol>
                    </CCol>
                  </CRow>
                </Form>
              )
            }}
          </Formik>
        </CCol>
      </CRow>
    </div>
  )
}

export default AddNews
