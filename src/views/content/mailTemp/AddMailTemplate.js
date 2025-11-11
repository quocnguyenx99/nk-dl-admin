import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { axiosClient } from '../../../axiosConfig'

import { toast } from 'react-toastify'

function AddMailTemp() {
  const [editorData, setEditorData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    name: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    name: Yup.string().required('Name là bắt buộc.'),
  })

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/mail-template', {
        title: values.title,
        name: values.name,
        description: editorData,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm mail template thành công!')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data mail temp is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h2>THÊM MAIL TEMPLATE MỚI</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/content/mail-temp'}>
              <CButton color="primary" type="button" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={10}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, setValues, values }) => {
              return (
                <Form>
                  <CCol md={6}>
                    <label htmlFor="title-input">Tiêu đề</label>
                    <Field name="title" type="text" as={CFormInput} id="title-input" />
                    <ErrorMessage name="title" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={6}>
                    <label htmlFor="name-input">Name</label>
                    <Field name="name" type="text" as={CFormInput} id="name-input" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="editor">Mô tả</label>
                    <CKedtiorCustom
                      data={editorData}
                      onChangeData={(data) => setEditorData(data)}
                    />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="visible-select">Hiển thị</label>
                    <Field
                      className={'w-50'}
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

export default AddMailTemp
