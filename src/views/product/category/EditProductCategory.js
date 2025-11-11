import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
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
import { toast } from 'react-toastify'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'

function EditProductCategory() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [categories, setCategories] = useState([])
  const [editorData, setEditorData] = useState('')

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  // const [brands, setBrands] = useState([])
  // const [dataCustomerSupport, setDataCustomerSupport] = useState([])

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  // upload category background
  const [selectedFileBackground, setSelectedFileBackground] = useState('')
  const [fileBackground, setFileBackground] = useState([])

  const initialValues = {
    title: '',
    homeTitle: '',
    friendlyUrl: '',
    picture: [],
    backgroundImage: [],
    parentId: '',
    color: '',
    visibleBrands: [],
    visibleSupport: [],
    // description: '',
    scriptCode: '',
    pageTitle: '',
    metaDesc: '',
    metaKeyword: '',
    visible: false,
    showHome: false,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc .'),
    pageTitle: Yup.string().required('Tiêu đề trang là bắt buộc.'),
    metaDesc: Yup.string().required('metaDescription là bắt buộc.'),
    metaKeyword: Yup.string().required('metaKeywords là bắt buộc.'),
    visible: Yup.string().required('Hiển thị là bắt buộc.'),
  })

  const fetchProductCategoriesData = async () => {
    try {
      const response = await axiosClient.get('admin/category')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Fetch categories data error', error)
    }
  }

  useEffect(() => {
    fetchProductCategoriesData()
  }, [])

  const fetchCategoriesData = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/category/${id}/edit`)
      const data = response.data.category

      if (response.data.status === true) {
        setValues({
          title: data.category_desc?.cat_name,
          homeTitle: data.category_desc.home_title,
          friendlyUrl: data.category_desc.friendly_url,
          parentId: data.parentid,
          color: data.color,
          // visibleBrands: [],
          // visibleSupport: [],
          // description: data.category_desc.description,
          scriptCode: data.category_desc.script_code,
          pageTitle: data.category_desc.friendly_title,
          metaDesc: data.category_desc.metadesc,
          metaKeyword: data.category_desc.metakey,
          visible: data.display,
          showHome: data.show_home,
        })
        setEditorData(data.category_desc.description)
        setSelectedFile(data.picture)
        setSelectedFileBackground(data.background)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch categories data error', error)
    }
  }

  useEffect(() => {
    fetchCategoriesData()
  }, [])

  //set img
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

  //set img category background
  function onFileChangeBackground(e) {
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
          setSelectedFileBackground(selectedFiles)
        }
      }
    })

    // Set file URLs for immediate preview
    setFileBackground(fileUrls)
  }

  const handleSubmit = async (values) => {
    // async requets fetch
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/category/${id}`, {
        cat_name: values.title,
        friendly_url: values.friendlyUrl,
        parentid: values.parentId,
        picture: selectedFile,
        color: values.color,
        home_title: values.homeTitle,
        script_code: values.scriptCode,
        // description: values.description,
        description: editorData,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        display: values.visible,
        show_home: values.showHome,
        background: selectedFileBackground,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật danh mục thành công.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Put product category data error', error)
      if (error.response) {
        if (error.response.status === 500) {
          navigate('/500')
        } else if (error.response.status === 404) {
          navigate('/404')
        }
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      }
    } finally {
      setIsLoading(false)
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
            <CCol md={6}>
              <h2>CHỈNH SỬA DANH MỤC</h2>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to="/product/category">
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol md={8}>
              <h6></h6>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, values, setValues }) => {
                  useEffect(() => {
                    fetchCategoriesData(setValues)
                  }, [setValues])
                  return (
                    <Form>
                      <CCol md={12}>
                        <label htmlFor="title-input">Tên danh mục</label>
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
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="category-select">Là con của</label>
                        <Field
                          name="parentId"
                          as={CFormSelect}
                          id="category-select"
                          onChange={(e) => setFieldValue('parentId', e.target.value)}
                          className="select-input"
                          text="Chuyên mục khác với thẻ, bạn có thể sử dụng nhiều cấp chuyên mục. Ví dụ: Trong chuyên mục nhạc, bạn có chuyên mục con là nhạc Pop, nhạc Jazz. Việc này hoàn toàn là tùy theo ý bạn."
                        >
                          <option value="0">Trống (0)</option>
                          {categories &&
                            categories.map((item) => (
                              <optgroup key={item.category_desc.cat_id}>
                                <option value={item.category_desc.cat_id}>
                                  {item.category_desc.cat_name} ({item.category_desc.cat_id})
                                </option>
                                {item.parenty &&
                                  item.parenty.map((subItem) => (
                                    <>
                                      <option key={subItem.cat_id} value={subItem.cat_id}>
                                        &nbsp;&nbsp;&nbsp;{'|--'}
                                        {subItem.category_desc.cat_name} ({subItem?.cat_id})
                                      </option>
                                      {subItem.parentx &&
                                        subItem.parentx.map((subSubCategory) => (
                                          <option
                                            key={subSubCategory.cat_id}
                                            value={subSubCategory.cat_id}
                                          >
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'|--'}
                                            {subSubCategory?.category_desc.cat_name}(
                                            {subSubCategory.cat_id})
                                          </option>
                                        ))}
                                    </>
                                  ))}
                              </optgroup>
                            ))}
                        </Field>
                        <ErrorMessage name="parentId" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="picture"
                          type="file"
                          id="formFile"
                          label="Hình ảnh danh mục"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="picture" component="div" className="text-danger" />

                        <div>
                          {file.length == 0 ? (
                            <div>
                              <CImage src={`${imageBaseUrl}` + selectedFile} width={200} />
                            </div>
                          ) : (
                            file.map((item, index) => <CImage key={index} src={item} width={200} />)
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="backgroundImage"
                          type="file"
                          id="formFile"
                          label="Hình ảnh background"
                          onChange={(e) => onFileChangeBackground(e)}
                        />
                        <br />
                        <ErrorMessage
                          name="backgroundImage"
                          component="div"
                          className="text-danger"
                        />

                        <div>
                          {fileBackground.length == 0 ? (
                            <div>
                              <CImage
                                src={`${imageBaseUrl}` + selectedFileBackground}
                                width={200}
                              />
                            </div>
                          ) : (
                            fileBackground.map((item, index) => (
                              <CImage key={index} src={item} width={200} />
                            ))
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="color-input">Màu sắc</label>
                        <Field name="color" type="text" as={CFormInput} id="color-input" />
                        <ErrorMessage name="color" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="homeTitle-input">Tiêu đề trang chủ</label>
                        <Field
                          name="homeTitle"
                          type="text"
                          as={CFormInput}
                          id="homeTitle-input"
                          text="Áp dụng cho danh mục được hiển thị ngoài trang chủ."
                        />
                        <ErrorMessage name="homeTitle" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      {/* <CCol md={12} className="overflow-scroll" style={{ height: '300px' }}>
                    <label htmlFor="visible-select">Thương hiệu</label>
                    {brands &&
                      brands.length > 0 &&
                      brands.map((item) => (
                        <div key={item.brandId}>
                          <Field
                            type="checkbox"
                            name="visibleBrands"
                            as={CFormCheck}
                            id={`brand-${item.brandId}`}
                            value={item.brandId}
                            label={item.title}
                            checked={values.visibleBrands.includes(item.brandId)}
                            onChange={() => {
                              const newValue = values.visibleBrands.includes(item.brandId)
                                ? values.visibleBrands.filter((id) => id !== item.brandId)
                                : [...values.visibleBrands, item.brandId]
                              setFieldValue('visibleBrands', newValue)
                            }}
                          />
                        </div>
                      ))}
                    <ErrorMessage name="visibleBrands" component="div" className="text-danger" />
                  </CCol>
                  <br /> */}

                      {/* <CCol md={12}>
                    <label htmlFor="visible-select">Nhân viên kinh doanh</label>
                    {dataCustomerSupport &&
                      dataCustomerSupport.length > 0 &&
                      dataCustomerSupport.map((item) => (
                        <div key={item.brand_id}>
                          <Field
                            type="checkbox"
                            name="visibleSupport"
                            as={CFormCheck}
                            id={`brand-${item.id}`}
                            value={item.id}
                            label={item.name}
                            checked={values.visibleSupport.includes(item.id)}
                            onChange={() => {
                              const newValue = values.visibleSupport.includes(item.id)
                                ? values.visibleSupport.filter((id) => id !== item.id)
                                : [...values.visibleSupport, item.id]
                              setFieldValue('visibleSupport', newValue)
                            }}
                          />
                        </div>
                      ))}
                    <ErrorMessage name="visibleSupport" component="div" className="text-danger" />
                  </CCol>
                  <br /> */}

                      <CCol md={12}>
                        <label htmlFor="scriptCode-input">Script code</label>
                        <Field
                          style={{ height: '100px' }}
                          name="scriptCode"
                          type="text"
                          as={CFormTextarea}
                          id="scriptCode-input"
                          text="Mã Script Code."
                        />
                        <ErrorMessage name="scriptCode" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      {/* <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả</label>
                        <Field
                          style={{ height: '100px' }}
                          name="description"
                          type="text"
                          as={CFormTextarea}
                          id="desc-input"
                          text="Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài giao diện hiện thị mô tả này."
                        />
                        <ErrorMessage name="description" component="div" className="text-danger" />
                      </CCol>
                      <br /> */}

                      <CCol md={12}>
                        <label htmlFor="editor">Mô tả</label>
                        <CKedtiorCustom
                          data={editorData}
                          onChangeData={(data) => setEditorData(data)}
                        />
                      </CCol>
                      <br />

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
                          name="metaKeyword"
                          type="text"
                          as={CFormInput}
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
                          as={CFormInput}
                          id="metaDesc-input"
                          text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                        />
                        <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="showHome-select">Hiển thị ở trang chủ</label>
                        <Field
                          name="showHome"
                          as={CFormSelect}
                          id="showHome-select"
                          className="select-input"
                          options={[
                            { label: 'Không', value: false },
                            { label: 'Có', value: true },
                          ]}
                          text="Cho phép danh mục hiển thị ở trang chủ, bên ngoài web"
                        />
                        <ErrorMessage name="showHome" component="div" className="text-danger" />
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
                            { label: 'Không', value: false },
                            { label: 'Có', value: true },
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

export default EditProductCategory
