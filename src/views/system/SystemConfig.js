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
} from '@coreui/react'
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import { toast } from 'react-toastify'

function SystemConfig() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const [selectedFileLogo, setSelectedFileLogo] = useState('')
  const [fileLogo, setFileLogo] = useState([])

  const initialValues = {
    pageTitle: '',
    metaDesc: '',
    metaExtra: '',
    scriptCode: '',
    charset: '',
    favicon: '',
    logo: '',
    hotline: '',
    email: '',
    emailSearch: '',
    address: '',
    isSearchEngines: 0,
    method: '',
    host: '',
    port: '',
    username: '',
    password: '',
    fromName: '',
    securityKey: '',
  }

  const validationSchema = Yup.object({
    // title: Yup.string().required('Tiêu đề là bắt buộc.').min(5, 'Tiêu đề phải có ít nhất 5 ký tự.'),
  })

  //set img favicon
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

  //set img logo
  function onFileChangeLogo(e) {
    const files = e.target.files
    const selectedFiles = []
    const fileUrls = []

    Array.from(files).forEach((file) => {
      // Create a URL for the file to preview
      const fileUrl = URL.createObjectURL(file)
      fileUrls.push(fileUrl)

      // Read the file as base64
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = (event) => {
        selectedFiles.push(event.target.result)

        // Set base64 data after all files have been read
        if (selectedFiles.length === files.length) {
          // Set the base64 version of the selected files
          setSelectedFileLogo(selectedFiles)
        }
      }
    })

    // Set file URLs for immediate preview
    setFileLogo(fileUrls)
  }

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get('admin/setting-system')
      const data = response.data

      if (data?.status === true) {
        const { settingSystem, settingLogo, settingSmtp } = data

        setValues({
          pageTitle: settingSystem?.title || '',
          metaDesc: settingSystem?.meta_desc || '',
          metaExtra: settingSystem?.meta_extra || '',
          scriptCode: settingSystem?.script || '',
          charset: settingSystem?.charset || '',
          hotline: settingLogo?.hotline || '',
          email: settingLogo?.email || '',
          emailSearch: settingLogo?.email_search || '',
          isSearchEngines: settingLogo?.tool_search || '',
          address: settingLogo?.address || '',
          method: settingSmtp?.method || '',
          host: settingSmtp?.host || '',
          port: settingSmtp?.port || '',
          username: settingSmtp?.username || '',
          password: settingSmtp?.password || '',
          fromName: settingSmtp?.from_name || '',
          securityKey: settingSmtp?.password_security || '',
        })

        setSelectedFile(settingSystem?.favicon || null)
        setSelectedFileLogo(settingLogo?.logo || null)
      } else if (data?.status === false && data?.mess === 'no permission') {
        setIsPermissionCheck(false)
      } else {
        console.error('No data found or no permission.')
      }
    } catch (error) {
      console.error('Error fetching system config:', error.message)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const response = await axiosClient.put(`admin/setting-system/1`, {
        title: values.pageTitle,
        meta_desc: values.metaDesc,
        meta_extra: values.metaExtra,
        script: values.scriptCode,
        charset: values.charset,
        favicon: selectedFile,
        logo: selectedFileLogo,
        hotline: values.hotline,
        email: values.email,
        email_search: values.emailSearch,
        address: values.address,
        tool_search: values.isSearchEngines,
        method: values.method,
        host: values.host,
        port: values.port,
        username: values.username,
        password: values.password,
        from_name: values.fromName,
        password_security: values.securityKey,
        // time_cache:
        //google_analytics_id
        //google_maps_api_id
      })
      if (response.data.status === true) {
        toast.success('Lưu lại cấu hình thay đổi!')
      }
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Put data system config is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
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
              <h2>CẤU HÌNH HỆ THỐNG</h2>
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
                  useEffect(() => {
                    fetchDataById(setValues)
                  }, [setValues])
                  return (
                    <Form>
                      <h6>Search Engine Optimization</h6>

                      <CCol md={8}>
                        <label htmlFor="pageTitle-input">Tiêu đề trang</label>
                        <Field name="pageTitle">
                          {({ field }) => (
                            <CFormInput {...field} type="text" id="pageTitle-input" />
                          )}
                        </Field>
                        <ErrorMessage name="pageTitle" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="metaDesc-input">Meta Description</label>
                        <Field
                          name="metaDesc"
                          type="text"
                          as={CFormTextarea}
                          id="metaDesc-input"
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="metaExtra-input">Meta Extra</label>
                        <Field
                          name="metaExtra"
                          type="text"
                          as={CFormTextarea}
                          id="metaExtra-input"
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="metaExtra" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="scriptCode-input">Script mở rộng cuối trang</label>
                        <Field
                          name="scriptCode"
                          type="text"
                          as={CFormTextarea}
                          id="scriptCode-input"
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="scriptCode" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <h5>Thông tin</h5>

                      <CCol md={8}>
                        <label htmlFor="charset-input">Charset</label>
                        <Field name="charset">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="charset-input"
                              className="w-25"
                            />
                          )}
                        </Field>
                        <ErrorMessage name="charset" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <CFormInput
                          name="favicon"
                          type="file"
                          id="formFile"
                          label="Favicon"
                          size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="favicon" component="div" className="text-danger" />

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

                      <CCol md={8}>
                        <CFormInput
                          name="logo"
                          type="file"
                          id="formFile"
                          label="Logo"
                          size="sm"
                          onChange={(e) => onFileChangeLogo(e)}
                        />
                        <br />
                        <ErrorMessage name="logo" component="div" className="text-danger" />

                        <div>
                          {fileLogo.length == 0 ? (
                            <div>
                              <CImage
                                className="border"
                                src={`${imageBaseUrl}${selectedFileLogo}`}
                                width={200}
                              />
                            </div>
                          ) : (
                            fileLogo.map((item, index) => (
                              <CImage className="border" key={index} src={item} width={200} />
                            ))
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="hotline-input">Hotline</label>
                        <Field name="hotline" type="text" as={CFormInput} id="hotline-input" />
                        <ErrorMessage name="hotline" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="email-input">Email</label>
                        <Field name="email" type="text" as={CFormInput} id="email-input" />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="emailSearch-input">Email tìm kiếm</label>
                        <Field
                          name="emailSearch"
                          type="text"
                          as={CFormInput}
                          id="emailSearch-input"
                        />
                        <ErrorMessage name="emailSearch" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="address-input">Address</label>
                        <Field
                          name="address"
                          type="text"
                          as={CFormTextarea}
                          id="address-input"
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="address" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="isSearchEngines-select">Tương tác công cụ tìm kiếm</label>
                        <Field
                          className={'w-25'}
                          size="sm"
                          name="isSearchEngines"
                          as={CFormSelect}
                          text={'Cho phép các công cụ tìm kiếm đánh chỉ mục website này.'}
                          id="isSearchEngines-select"
                          options={[
                            { label: 'Không', value: 0 },
                            { label: 'Có', value: 1 },
                          ]}
                        />
                        <ErrorMessage
                          name="isSearchEngines"
                          component="div"
                          className="text-danger"
                        />
                      </CCol>
                      <br />

                      <h6>SMTP</h6>

                      <CCol md={8}>
                        <label htmlFor="method-input">Method</label>
                        <Field
                          name="method"
                          type="text"
                          as={CFormInput}
                          id="method-input"
                          className="w-25"
                        />
                        <ErrorMessage name="method" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="host-input">Host</label>
                        <Field name="host" type="text" as={CFormInput} id="host-input" />
                        <ErrorMessage name="host" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="port-input">Port</label>
                        <Field
                          name="port"
                          type="text"
                          as={CFormInput}
                          id="port-input"
                          className={'w-25'}
                        />
                        <ErrorMessage name="port" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="username-input">Username</label>
                        <Field name="username" type="text" as={CFormInput} id="username-input" />
                        <ErrorMessage name="username" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="password-input">Password</label>
                        <Field
                          name="password"
                          type="password"
                          as={CFormInput}
                          id="password-input"
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="fromName-input">From name</label>
                        <Field name="fromName" type="text" as={CFormInput} id="fromName-input" />
                        <ErrorMessage name="fromName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <h6>Bảo mật website</h6>
                      <CCol md={8}>
                        <label htmlFor="securityKey-input">Mật khẩu bảo vệ</label>
                        <Field
                          name="securityKey"
                          type="text"
                          as={CFormInput}
                          id="securityKey-input"
                        />
                        <ErrorMessage name="securityKey" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm">
                          {'Lưu thay đổi'}
                        </CButton>
                      </CCol>
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

export default SystemConfig
