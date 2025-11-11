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
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import { formatNumber, unformatNumber } from '../../helper/utils'
import { toast } from 'react-toastify'

function ProductConfig() {
  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    point: '10000',
    pointUsed: '5000',
    productPerPage: '10',
    widthImage: '300',
    pageTitle: '',
    metaKeyword: '',
    metaDesc: '',
    visible: 1,
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

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/config/1/edit`)
      const data = response.data.data
      if (data && response.data.status === true) {
        setValues({
          point: data.priceOfPoint,
          productPerPage: data.productOfPage,
          widthImage: data.width,
          pageTitle: data.title,
          metaKeyword: data.metaKeywords,
          metaDesc: data.metaDescription,
          visible: data.displayPicture,
          pointUsed: data.valueOfPoint,
        })
        setSelectedFile(data.picture)
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data id product config is error', error.message)
    }
  }

  useEffect(() => {
    fetchDataById()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put('admin/config/1', {
        title: values.pageTitle,
        metaKeywords: values.metaKeyword,
        metaDescription: values.metaDesc,
        priceOfPoint: values.point,
        valueOfPoint: values.pointUsed,
        productOfPage: values.productPerPage,
        width: values.widthImage,
        display: values.visible,
        picture: selectedFile,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật cấu hình thành công')
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Put product config data is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h3>CẤU HÌNH SẢN PHẨM</h3>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={8}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, setValues }) => {
              useEffect(() => {
                fetchDataById(setValues)
              }, [setValues])
              return (
                <Form>
                  <h6>Search Engine Optimization</h6>
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
                    <ErrorMessage name="pageTitle" component="div" className="text-danger" />
                  </CCol>
                  <br />
                  <CCol md={12}>
                    <label htmlFor="metaKeyword-input">Meta keywords</label>
                    <Field
                      style={{ height: '100px' }}
                      name="metaKeyword"
                      type="text"
                      as={CFormTextarea}
                      id="metaKeyword-input"
                      text="Độ dài của meta keywords chuẩn là từ 100 đến 150 ký tự, trong đó có ít nhất 4 dấu phẩy (,)."
                    />
                    <ErrorMessage name="metaKeyword" component="div" className="text-danger" />
                  </CCol>
                  <br />
                  <CCol md={12}>
                    <label htmlFor="metaDesc-input">Meta description</label>
                    <Field
                      style={{ height: '100px' }}
                      name="metaDesc"
                      type="text"
                      as={CFormTextarea}
                      id="metaDesc-input"
                      text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                    />
                    <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <h6>Cấu hình trang danh sách</h6>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="point-input">
                      Điểm tích lũy áp dụng cho đơn hàng (đơn vị VND)
                    </label>
                    <Field name="point">
                      {({ field }) => (
                        <CFormInput
                          {...field}
                          type="text"
                          id="point-input"
                          text={'Thành viên tích luỹ điểm khi đơn hàng ở trạng thái hoàn tất.'}
                          value={formatNumber(field.value)}
                          onChange={(e) => {
                            const rawValue = unformatNumber(e.target.value)
                            setFieldValue(field.name, rawValue)
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="point" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="pointUsed-input">
                      Giá trị sử dụng điểm thưởng (đơn vị VND)
                    </label>
                    <Field name="pointUsed">
                      {({ field }) => (
                        <CFormInput
                          {...field}
                          type="text"
                          id="pointUsed-input"
                          text={'Điểm thưởng sử dụng khi thanh toán đơn hàng.'}
                          value={formatNumber(field.value)}
                          onChange={(e) => {
                            const rawValue = unformatNumber(e.target.value)
                            setFieldValue(field.name, rawValue)
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="pointUsed" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="productPerPage-input">Số sản phẩm xem trên 1 trang</label>
                    <Field
                      name="productPerPage"
                      type="text"
                      as={CFormInput}
                      id="productPerPage-input"
                    />
                    <ErrorMessage name="productPerPage" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="widthImage-input">Chiều ngang ảnh</label>
                    <Field name="widthImage" type="text" as={CFormInput} id="widthImage-input" />
                    <ErrorMessage name="widthImage" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="visible-select">Hiển thị ảnh no-photo</label>
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

                  <CCol md={12}>
                    <CFormInput
                      name="avatar"
                      type="file"
                      id="formFile"
                      label="Ảnh no photo"
                      size="sm"
                      onChange={(e) => onFileChange(e)}
                    />
                    <br />
                    <ErrorMessage name="avatar" component="div" className="text-danger" />

                    <div>
                      {file.length == 0 ? (
                        <div>
                          <CImage src={`${imageBaseUrl}${selectedFile}`} width={370} />
                        </div>
                      ) : (
                        file.map((item, index) => <CImage key={index} src={item} width={370} />)
                      )}
                    </div>
                  </CCol>
                  <br />

                  <CCol xs={12}>
                    <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CSpinner size="sm"></CSpinner> Đang cập nhật...
                        </>
                      ) : (
                        'Lưu thay đổi'
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

export default ProductConfig
