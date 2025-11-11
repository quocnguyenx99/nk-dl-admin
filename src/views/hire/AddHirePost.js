import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormLabel,
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
import CKedtiorCustom from '../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function AddHirePost() {
  const [editorData, setEditorData] = useState('')
  const [dataHireCategory, setDataHireCategory] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const today = new Date()
  const initialValues = {
    title: '',
    startDate: new Date(),
    salary: '',
    address: '',
    exp: '',
    level: '',
    quantity: '',
    work_mode: '',
    required_degree: '',
    friendlyUrl: '',
    metaKeyword: '',
    metaDesc: '',
    hire_cate: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    startDate: Yup.date()
      .min(today, 'Ngày hết hạn không được bé hơn ngày hôm nay')
      .required('Ngày hết hạn là bắt buộc'),
    salary: Yup.string().required('Mức lương là bắt buộc.'),
    address: Yup.string().required('Địa chỉ là bắt buộc.'),
    exp: Yup.string().required('Kinh nghiệm yêu cầu là bắt buộc.'),
    level: Yup.string().required('Cấp bậc vị trí là bắt buộc'),
    quantity: Yup.string().required('Số lượng tuyển dụng là bắt buộc.'),
    work_mode: Yup.string().required('Hình thức làm việc là bắt buộc.'),
    required_degree: Yup.string().required('Bằng cấp là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc.'),
    metaKeyword: Yup.string(),
    metaDesc: Yup.string(),
    visible: Yup.number()
      .integer('Visible must be an integer')
      .oneOf([0, 1], 'Visible must be 0 or 1'),
  })

  const fetchHireCategory = async () => {
    try {
      const response = await axiosClient.get('admin/hire-category')
      const data = response.data.data
      setDataHireCategory(data)
    } catch (error) {
      console.error('Fetch data hire category is error', error)
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
        toast.success('Thêm bài đăng tuyển thành công!')
      }
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data hire post is error', error)
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
          <h3>THÊM MỚI BÀI ĐĂNG TUYỂN</h3>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/hire/post'}>
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

                      <h6>Thông tin chung</h6>
                      <CCol>
                        <label>Ngày hết hạn:</label>
                        <span className="ms-2">
                          <DatePicker
                            dateFormat={'dd-MM-yyyy'}
                            showIcon
                            selected={values.startDate}
                            onChange={(date) => setFieldValue('startDate', date)}
                          />
                        </span>
                        <ErrorMessage name="startDate" component="p" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="salary-input">Mức lương</label>
                        <Field name="salary" type="text" as={CFormInput} id="salary-input" />
                        <ErrorMessage name="salary" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="address-input">Địa điểm làm việc</label>
                        <Field name="address" type="text" as={CFormInput} id="address-input" />
                        <ErrorMessage name="address" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="exp-input">Kinh nghiệm yêu cầu</label>
                        <Field name="exp" type="text" as={CFormInput} id="exp-input" />
                        <ErrorMessage name="exp" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="level-input">Cấp bậc</label>
                        <Field name="level" type="text" as={CFormInput} id="level-input" />
                        <ErrorMessage name="level" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="quantity-input">Số lượng cần tuyển</label>
                        <Field name="quantity" type="text" as={CFormInput} id="quantity-input" />
                        <ErrorMessage name="quantity" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="required_degree-input">Bằng cấp yêu cầu</label>
                        <Field
                          name="required_degree"
                          type="text"
                          as={CFormInput}
                          id="required_degree-input"
                        />
                        <ErrorMessage
                          name="required_degree"
                          component="div"
                          className="text-danger"
                        />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="work_mode-input">Hình thức làm việc</label>
                        <Field name="work_mode" type="text" as={CFormInput} id="work_mode-input" />
                        <ErrorMessage name="work_mode" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Nội dung tuyển dụng</label>
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
                        <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
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
                          text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                        />
                        <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                      </CCol>
                      <br />
                    </CCol>

                    <CCol md={4}>
                      <CCol md={12}>
                        <label htmlFor="hire_cate-select">Danh mục vị trí tuyển dụng</label>
                        <Field
                          name="hire_cate"
                          as={CFormSelect}
                          id="hire_cate-select"
                          options={[
                            { label: 'Chọn danh mục', value: '' },
                            ...(dataHireCategory && dataHireCategory?.length > 0
                              ? dataHireCategory.map((cate) => ({
                                  label: cate.title,
                                  value: cate.id,
                                }))
                              : []),
                          ]}
                        />
                        <ErrorMessage name="hire_cate" component="div" className="text-danger" />
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

export default AddHirePost
