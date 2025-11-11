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
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import { toast } from 'react-toastify'

function AddAdvertise() {
  const [dataAdvertiseCategory, setDataAdvertiseCategroy] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const initialValues = {
    title: '',
    positionCate: '',
    width: '',
    height: '',
    url: '',
    target: '_self',
    desc: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    // title: Yup.string().required('Tiêu đề là bắt buộc.'),
    // friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc.'),
    // pageTitle: Yup.string().required('Tiêu đề bài viết là bắt buộc.'),
    // metaKeyword: Yup.string().required('Meta keywords là bắt buộc.'),
    // metaDesc: Yup.string().required('Meta description là bắt buộc.'),
    // visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
  })

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

  const fetchDataAdvertiseCategory = async () => {
    try {
      const response = await axiosClient.get(`admin/ad-pos`)
      if (response.data.status === 'success') {
        setDataAdvertiseCategroy(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data advertise is error', error)
    }
  }

  useEffect(() => {
    fetchDataAdvertiseCategory()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/advertise', {
        title: values.title,
        picture: selectedFile,
        width: values.width,
        height: values.height,
        pos: values.positionCate,
        link: values.url,
        description: values.desc,
        target: values.target,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm advertise thành công!')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data advertise is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h3>THÊM MỚI ADVERTISE</h3>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/advertise'}>
              <CButton color="primary" type="button" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={8}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, setValues, values }) => {
              return (
                <Form>
                  <CCol md={12}>
                    <label htmlFor="title-input">Tiêu đề </label>
                    <Field name="title">
                      {({ field }) => (
                        <CFormInput
                          {...field}
                          type="text"
                          id="title-input"
                          text="Tiêu đề được sử dụng trên trang mạng của bạn và làm thẻ ALT của banner."
                        />
                      )}
                    </Field>
                    <ErrorMessage name="title" component="div" className="text-danger" />
                  </CCol>
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
                    <label htmlFor="positionCate-select">Danh mục đăng</label>
                    <Field
                      className="component-size"
                      name="positionCate"
                      as={CFormSelect}
                      id="positionCate-select"
                      text="Lựa chọn danh mục sẽ hiển thị banner ngoài trang chủ."
                      onChange={(event) => {
                        const selectedValue = event.target.value
                        setFieldValue('positionCate', selectedValue)

                        const selectedCategory = dataAdvertiseCategory?.find(
                          (banner) => banner?.name === selectedValue,
                        )

                        if (selectedCategory) {
                          setFieldValue('width', selectedCategory.width)
                          setFieldValue('height', selectedCategory.height)
                        } else {
                          setFieldValue('width', '')
                          setFieldValue('height', '')
                        }
                      }}
                      options={[
                        { label: 'Chọn vị trí', value: '' },
                        ...(dataAdvertiseCategory && dataAdvertiseCategory.length > 0
                          ? dataAdvertiseCategory.map((banner) => ({
                              label: banner.title,
                              value: banner.name,
                            }))
                          : []),
                      ]}
                    />
                    <ErrorMessage name="positionCate" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="width-input">Chiều rộng</label>
                    <Field
                      readOnly
                      name="width"
                      type="text"
                      as={CFormInput}
                      id="width-input"
                      text="Sử dụng đơn vị pixel (px)."
                    />
                    <ErrorMessage name="width" component="div" className="text-danger" />
                  </CCol>
                  <br />
                  <CCol md={12}>
                    <label htmlFor="height-input">Chiều cao</label>
                    <Field
                      readOnly
                      name="height"
                      type="text"
                      as={CFormInput}
                      id="height-input"
                      text="Sử dụng đơn vị pixel (px)."
                    />
                    <ErrorMessage name="height" component="div" className="text-danger" />
                  </CCol>
                  <br />
                  <CCol md={12}>
                    <label htmlFor="url-input">Liên kết</label>
                    <Field
                      name="url"
                      type="text"
                      as={CFormInput}
                      id="url-input"
                      text="Đường dẫn tuyệt đối hoặc tương đối."
                    />
                    <ErrorMessage name="url" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="target-select">Đích đến</label>
                    <Field
                      className="component-size"
                      name="target"
                      as={CFormSelect}
                      id="target-select"
                      text="Loại hiển thị của liên kết. Mặc định liên kết tại trang (_self)."
                      options={[
                        { label: 'Tại trang (_self)', value: '_self' },
                        { label: 'Cửa sổ mới (_blank)', value: '_blank' },
                        { label: 'Cửa sổ cha (_parent)', value: '_parent' },
                        { label: 'Cửa sổ trên cùng (_top)', value: '_top' },
                      ]}
                    />
                    <ErrorMessage name="target" component="div" className="text-danger" />
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
                          <CSpinner size="sm"></CSpinner> Đang thêm mới...
                        </>
                      ) : (
                        'Thêm mới'
                      )}
                    </CButton>
                  </CCol>
                </Form>
              )
            }}
          </Formik>
        </CCol>
      </CRow>
    </div>
  )
}

export default AddAdvertise
