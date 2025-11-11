import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'

import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'

function AddProductProperties() {
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const catId = searchParams.get('cat_id')

  const [propertiesChild, setPropertiesChild] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    friendlyUrl: '',
    parentId: '0',
    desc: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc .'),
    // childOf: Yup.string().required('Chọn thuộc tính cha là bắt buộc.'),
    // desc: Yup.string().required('Mô tả thuộc tính là bắt buộc.'),
    visible: Yup.string().required('Hiển thị là bắt buộc.'),
  })

  const fetchDataCategoryChild = async () => {
    try {
      const response = await axiosClient.get(`admin/cat-option-child/${catId}`)
      const data = response.data.listOption

      if (data && response.data.status === true) {
        setPropertiesChild(data)
      }
    } catch (error) {
      console.error('Fetch data categories child option is error', error)
    }
  }

  useEffect(() => {
    fetchDataCategoryChild()
  }, [])

  const handleSubmit = async (values) => {
    // api for submit
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/cat-option', {
        title: values.title,
        parentid: values.parentId,
        cat_id: catId,
        slug: values.friendlyUrl,
        description: values.desc,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm mới thuộc tính thành công.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post product properties data error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <h2>THÊM MỚI THUỘC TÍNH</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={`/product/properties`}>
              <CButton color="primary" type="submit" size="sm">
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
            {({ setFieldValue }) => (
              <Form>
                <CCol md={12}>
                  <label htmlFor="title-input">Tiêu đề</label>
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
                  <label htmlFor="url-input">Chuỗi đường dẫn</label>
                  <Field
                    name="friendlyUrl"
                    type="text"
                    as={CFormInput}
                    id="url-input"
                    text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chuỗi này bao gồm chữ cái thường, số và dấu gạch ngang (-). VD: vi-tinh-nguyen-kim-to-chuc-su-kien-tri-an-dip-20-nam-thanh-lap"
                  />
                  <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="input-selectParent">Là con của</label>
                  <Field
                    name="parentId"
                    as={CFormSelect}
                    id="input-selectParent"
                    onChange={(e) => setFieldValue('parentId', e.target.value)}
                    className="select-input"
                    options={[
                      { label: 'Trống', value: '0' },
                      ...(propertiesChild && propertiesChild.length > 0
                        ? propertiesChild.map((option) => ({
                            label: option.title,
                            value: option.op_id,
                          }))
                        : []),
                    ]}
                  />
                  <ErrorMessage name="parentId" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="desc-input">Mô tả</label>
                  <Field
                    style={{ height: '100px' }}
                    name="desc"
                    type="text"
                    as={CFormTextarea}
                    id="desc-input"
                    text="Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài giao diện hiện thị mô tả này."
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
                    className="select-input"
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
                      'Thêm mới'
                    )}
                  </CButton>
                </CCol>
              </Form>
            )}
          </Formik>
        </CCol>
      </CRow>
    </div>
  )
}

export default AddProductProperties
