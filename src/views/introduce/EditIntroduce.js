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
import { Link, useLocation } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import { toast } from 'react-toastify'
import CKedtiorCustom from '../../components/customEditor/ckEditorCustom'

function EditIntroduce() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(false)

  const [editorData, setEditorData] = useState('')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const initialValues = {
    title: '',
    friendlyUrl: '',
    pageTitle: '',
    metaKeyword: '',
    metaDesc: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc.'),
    pageTitle: Yup.string().required('Tiêu đề bài viết là bắt buộc.'),
    metaKeyword: Yup.string().required('Meta keywords là bắt buộc.'),
    metaDesc: Yup.string().required('Meta description là bắt buộc.'),
    visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
  })

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/about/${id}/edit`)
      const data = response.data.data
      if (data) {
        setValues({
          title: data?.about_desc?.title,
          friendlyUrl: data?.about_desc?.friendly_url,
          pageTitle: data?.about_desc?.friendly_title,
          metaKeyword: data?.about_desc?.metakey,
          metaDesc: data?.about_desc?.metadesc,
          visible: data?.display,
        })
        setEditorData(data?.about_desc?.description)
        setSelectedFile(data?.picture)
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data id intro is error', error.message)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/about/${id}`, {
        title: values.title,
        description: editorData,
        picture: selectedFile,
        friendly_url: values.friendlyUrl,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật giới thiệu thành công!')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Put data introduce is error', error)
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
      {!isPermissionCheck ? (
        <h5>
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <CRow className="mb-3">
            <CCol>
              <h2>CHỈNH SỬA GIỚI THIỆU</h2>
            </CCol>

            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to={'/about'}>
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
                  useEffect(() => {
                    fetchDataById(setValues)
                  }, [setValues, id])
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
                                  placeholder="Nhập tiêu đề ở đây"
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

                          <h6>Search Engine Optimization</h6>
                          <br />
                          <CCol md={12}>
                            <label htmlFor="url-input">Chuỗi đường dẫn</label>
                            <Field
                              name="friendlyUrl"
                              type="text"
                              as={CFormInput}
                              id="url-input"
                              text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chuỗi này bao gồm chữ cái thường, số và dấu gạch ngang (-). VD: vi-tinh-nguyen-kim-to-chuc-su-kien-tri-an-dip-20-nam-thanh-lap"
                            />
                            <ErrorMessage
                              name="friendlyUrl"
                              component="div"
                              className="text-danger"
                            />
                          </CCol>
                          <br />
                          <CCol md={12}>
                            <label htmlFor="pageTitle-input">Tiêu đề trang</label>
                            <Field
                              name="pageTitle"
                              type="text"
                              as={CFormInput}
                              id="pageTitle-input"
                              text="Độ dài của tiêu đề trang tối đa 60 ký tự."
                            />
                            <ErrorMessage
                              name="pageTitle"
                              component="div"
                              className="text-danger"
                            />
                          </CCol>
                          <br />
                          <CCol md={12}>
                            <label htmlFor="metaKeyword-input">Meta keywords</label>
                            <Field
                              name="metaKeyword"
                              type="text"
                              as={CFormTextarea}
                              id="metaKeyword-input"
                              text="Độ dài của meta keywords chuẩn là từ 100 đến 150 ký tự, trong đó có ít nhất 4 dấu phẩy (,)."
                            />
                            <ErrorMessage
                              name="metaKeyword"
                              component="div"
                              className="text-danger"
                            />
                          </CCol>
                          <br />
                          <CCol md={12}>
                            <label htmlFor="metaDesc-input">Meta description</label>
                            <Field
                              name="metaDesc"
                              type="text"
                              as={CFormTextarea}
                              id="metaDesc-input"
                              text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                            />
                            <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                          </CCol>
                          <br />
                        </CCol>

                        <CCol md={4}>
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
                                { label: 'Không', value: 0 },
                                { label: 'Có', value: 1 },
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
                                'Cập nhật'
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
        </>
      )}
    </div>
  )
}

export default EditIntroduce
