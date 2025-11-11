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
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { ErrorMessage, FastField, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'

import '../detail/css/addProductDetail.css'
import { formatNumber, unformatNumber } from '../../../helper/utils'
import { toast } from 'react-toastify'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { CKEditor } from 'ckeditor4-react'

function AddProductDetail() {
  const [descEditor, setDescEditor] = useState('')
  const [promotionEditor, setPromotionEditor] = useState('')
  const [videoEditor, setVideoEditor] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  // category
  const [categories, setCategories] = useState([])

  // brand
  const [brands, setBrands] = useState([])

  // status
  const [status, setStatus] = useState([])

  // properties
  const [dataProductProperties, setDataProductProperties] = useState([])

  // technology
  const [tech, setTech] = useState([])

  // category (ngành hàng)
  const [industryCategory, setIndustryCategory] = useState('1') // formerly choosenCategory

  // danh mục cha
  const [parentCategories, setParentCategories] = useState([]) // formerly selectedCategory

  // danh mục con
  const [childCategories, setChildCategories] = useState([]) // formerly selectedChildCate

  const [selectedStatus, setSelectedStatus] = useState('')

  const [activeTab, setActiveTab] = useState('tab1')

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  // editor
  const [editorData, setEditorData] = useState('')
  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  // upload list of images and show images
  const [selectedFileDetail, setSelectedFileDetail] = useState([])
  const [fileDetail, setFileDetail] = useState([])
  const [selectedIndexes, setSelectedIndexes] = useState([])

  const initialValues = {
    title: '',
    friendlyUrl: '',
    pageTitle: '',
    metaKeywords: '',
    metaDescription: '',
    syndicationCode: '',
    productCodeNumber: '',
    productCode: '',
    price: 0,
    marketPrice: 0,
    brand: '',
    stock: 0,
    visible: 0,
    star: 4.5,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    // friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc .'),
    // parentId: Yup.string().required('Chọn danh mục cha là bắt buộc.'),
    // pageTitle: Yup.string().required('Tiêu đề trang là bắt buộc.'),
    // metaDesc: Yup.string().required('metaDescription là bắt buộc.'),
    // metaKeyword: Yup.string().required('metaKeywords là bắt buộc.'),
    // visible: Yup.string().required('Hiển thị là bắt buộc.'),
    star: Yup.number()
      .min(1, 'Giá trị tối thiểu là 1')
      .max(5, 'Giá trị tối đa là 5')
      .test(
        'is-decimal',
        'Số sao phải là số thập phân, ví dụ: 1.2, 4.5',
        (value) => value === undefined || /^\d+(\.\d+)?$/.test(value),
      ),
  })

  const fetchData = async () => {
    try {
      const [categoriesResult, brandsResult, statusResult] = await Promise.allSettled([
        axiosClient.get('admin/category'),
        axiosClient.get('admin/brand?type=all'),
        axiosClient.get('admin/productStatus'),
      ])

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data.data)
      } else {
        console.error('Fetch categories data error', categoriesResult.reason)
      }

      if (brandsResult.status === 'fulfilled' && brandsResult.value.data.status === true) {
        setBrands(brandsResult.value.data.list)
      } else {
        console.error('Fetch brands data error', brandsResult.reason)
      }

      if (statusResult.status === 'fulfilled' && statusResult.value.data.status === 'success') {
        setStatus(statusResult.value.data.list.data)
      } else {
        console.error('Fetch status data error', statusResult.reason)
      }
    } catch (error) {
      console.error('Fetch data error', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchProductProperties = async () => {
    try {
      const response = await axiosClient.get(
        `admin/show-properties-category?cat_id=${industryCategory}`,
      )
      const data = response.data.data

      if (data) {
        setDataProductProperties(data)
      }
    } catch (error) {
      console.error('Fetch data categories is error', error)
    }
  }

  useEffect(() => {
    fetchProductProperties()
  }, [industryCategory])

  //set img detail
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

  // set list of images
  const onFileChangeDetail = (e) => {
    const selectedFiles = []
    const targetFiles = e.target.files
    const targetFilesObject = [...targetFiles]
    let files = e.target.files
    let newSelectedFileDetail = []

    function readNextFile(index) {
      if (index < files.length) {
        let fileReader = new FileReader()
        fileReader.onload = (event) => {
          let newFileDetail = event.target.result
          newSelectedFileDetail.push(newFileDetail)
          readNextFile(index + 1)
        }
        fileReader.readAsDataURL(files[index])
      } else {
        setSelectedFileDetail((prevFiles) => [...prevFiles, ...newSelectedFileDetail])
      }
    }
    readNextFile(0)
    targetFilesObject.map((item) => {
      return selectedFiles.push(URL.createObjectURL(item))
    })
    setFileDetail((prevFiles) => [...prevFiles, ...selectedFiles])
  }

  const toggleSelect = (index) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const removeSelectedImages = () => {
    const filteredFileDetail = fileDetail.filter((_, i) => !selectedIndexes.includes(i))
    const filteredSelectedFileDetail = selectedFileDetail.filter(
      (_, i) => !selectedIndexes.includes(i),
    )

    setFileDetail(filteredFileDetail)
    setSelectedFileDetail(filteredSelectedFileDetail)
    setSelectedIndexes([])
  }

  const handleSubmit = async (values) => {
    //api for submit
    const productData = {
      title: values.title,
      description: editorData,
      short: descEditor,
      // op_search: tech.reduce((acc, item) => {
      //   if (item.properties_value) {
      //     return [...acc, ...item.properties_value.map((prop) => prop.id)]
      //   }
      //   return acc
      // }, []),
      cat_id: parentCategories?.[0],
      cat_list: [industryCategory, ...parentCategories, ...childCategories],
      friendly_title: values.pageTitle,
      friendly_url: values.friendlyUrl,
      metakey: values.metaKeywords,
      metadesc: values.metaDescription,
      code_script: values.syndicationCode,
      maso: values.productCodeNumber,
      macn: values.productCode,
      price: values.price,
      price_old: values.marketPrice,
      brand_id: values.brand,
      status: selectedStatus,
      stock: values.stock,
      display: values.visible,
      picture: selectedFile,
      technologies: tech,
      picture_detail: selectedFileDetail,
      votes: values.star,
    }
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/product', productData)

      const { status, message, mess } = response.data

      if (status === true) {
        toast.success('Thêm sản phẩm mới thành công!')
      } else {
        const messages = {
          maso: 'Mã số đã tồn tại trong database!',
          macn: 'Mã kho đã tồn tại trong database!',
          title: 'Tiêu đề đã tồn tại trong database!',
          stock: 'Sản phẩm NGỪNG KINH DOANH không được set HOT hoặc FLASH-SALE!',
        }

        if (messages[message]) {
          toast.warning(messages[message])
        }

        if (mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      }
    } catch (error) {
      console.error('Post product data is error', error)
      toast.error('Đã xảy ra lỗi. Xin vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  // Change technology in ckeditor
  const handleEditorChange = (propId, description) => {
    setTech((prevTech) => {
      const existingIndex = prevTech.findIndex((item) => item.id === propId)

      if (existingIndex !== -1) {
        // Update existing item
        const updatedTech = [...prevTech]
        updatedTech[existingIndex] = {
          ...updatedTech[existingIndex],
          description: description,
        }
        return updatedTech
      } else {
        // Add new item
        return [
          ...prevTech,
          {
            id: propId,
            description: description,
          },
        ]
      }
    })
  }

  // Handle checkbox changes for properties
  const handleCheckboxChange = (propId, optionId, isChecked) => {
    setTech((prevTech) => {
      const existingIndex = prevTech.findIndex((item) => item.id === propId)

      if (existingIndex !== -1) {
        // Update existing item
        const updatedTech = [...prevTech]
        const currentItem = updatedTech[existingIndex]

        if (isChecked) {
          // Add option to properties_value
          const properties_value = currentItem.properties_value || []
          if (!properties_value.some((prop) => prop.id === optionId)) {
            updatedTech[existingIndex] = {
              ...currentItem,
              properties_value: [...properties_value, { id: optionId }],
            }
          }
        } else {
          // Remove option from properties_value
          const properties_value = currentItem.properties_value || []
          updatedTech[existingIndex] = {
            ...currentItem,
            properties_value: properties_value.filter((prop) => prop.id !== optionId),
          }
        }

        return updatedTech
      } else {
        if (isChecked) {
          return [
            ...prevTech,
            {
              id: propId,
              description: '',
              properties_value: [{ id: optionId }],
            },
          ]
        }
        return prevTech
      }
    })
  }

  console.log('tech ', tech)

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h3>THÊM MỚI SẢN PHẨM</h3>
        </CCol>
        <CCol md={{ span: 4, offset: 4 }}>
          <div className="d-flex justify-content-end">
            <Link to={`/product`}>
              <CButton color="primary" type="submit" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <CRow>
                <CCol md={9}>
                  <CCol md={12}>
                    <FastField name="title">
                      {({ field }) => (
                        <CFormInput
                          size="lg"
                          {...field}
                          type="text"
                          id="title-input"
                          placeholder="Nhập tiêu đề ở tại đây"
                        />
                      )}
                    </FastField>
                    <ErrorMessage name="title" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="visible-select">Bài viết mô tả sản phẩm</label>
                    <CKedtiorCustom
                      data={editorData}
                      onChangeData={(data) => setEditorData(data)}
                    />
                  </CCol>

                  <CCol md={12}>
                    <div className="tabs">
                      <button
                        type="button"
                        className={activeTab === 'tab1' ? 'active' : ''}
                        onClick={() => handleTabClick('tab1')}
                      >
                        Mô tả
                      </button>
                      <button
                        type="button"
                        className={activeTab === 'tab2' ? 'active' : ''}
                        onClick={() => handleTabClick('tab2')}
                      >
                        Thông tin khuyến mãi
                      </button>

                      <button
                        type="button"
                        className={activeTab === 'tab3' ? 'active' : ''}
                        onClick={() => handleTabClick('tab3')}
                      >
                        Video
                      </button>

                      <button
                        type="button"
                        className={activeTab === 'tab4' ? 'active' : ''}
                        onClick={() => handleTabClick('tab4')}
                      >
                        Thông số kỹ thuật
                      </button>
                    </div>
                    <div className="tab-contents ">
                      <div className={`tab-content ${activeTab === 'tab1' ? 'active' : ''}`}>
                        <CCol md={12}>
                          <CKedtiorCustom
                            data={descEditor}
                            onChangeData={(data) => setDescEditor(data)}
                          />
                        </CCol>
                      </div>
                      <div className={`tab-content ${activeTab === 'tab2' ? 'active' : ''}`}>
                        <CCol md={12}>
                          <CKedtiorCustom
                            data={promotionEditor}
                            onChangeData={(data) => setPromotionEditor(data)}
                          />
                        </CCol>
                      </div>
                      <div className={`tab-content ${activeTab === 'tab3' ? 'active' : ''}`}>
                        <CCol md={12}>
                          <CKedtiorCustom
                            data={videoEditor}
                            onChangeData={(data) => setVideoEditor(data)}
                          />
                        </CCol>
                      </div>
                      <div className={`tab-content ${activeTab === 'tab4' ? 'active' : ''}`}>
                        <CCol md={12}>
                          <table
                            className="tech-table"
                            style={{
                              tableLayout: 'fixed',
                              backgroundColor: '#fff',
                            }}
                          >
                            {dataProductProperties &&
                              dataProductProperties.length > 0 &&
                              dataProductProperties?.map((prop, index) => {
                                // Find existing tech item for this property
                                const existingTechItem = tech.find((item) => item.id === prop.id)

                                return (
                                  <tr key={prop.id}>
                                    <td>
                                      <strong>
                                        {index + 1}. {prop.title}
                                      </strong>
                                      <CKEditor
                                        className="mt-2"
                                        config={{
                                          height: 70,
                                          versionCheck: false,
                                        }}
                                        id={`editor-${prop.id}`}
                                        data={existingTechItem?.description || ''}
                                        onChange={(event) => {
                                          const data = event.editor.getData()
                                          handleEditorChange(prop.id, data)
                                        }}
                                      />

                                      <div className="d-flex gap-3 flex-wrap mt-2">
                                        {prop?.properties_value?.map((option) => {
                                          const isSelected =
                                            existingTechItem?.properties_value?.some(
                                              (propValue) => propValue.id === option.id,
                                            ) || false

                                          return (
                                            <CFormCheck
                                              key={option?.id}
                                              label={option?.name}
                                              aria-label="Default select example"
                                              id={`flexCheckDefault_${option?.id}`}
                                              value={option?.id}
                                              checked={isSelected}
                                              onChange={(e) => {
                                                const isChecked = e.target.checked
                                                handleCheckboxChange(prop.id, option.id, isChecked)
                                              }}
                                            />
                                          )
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                          </table>
                        </CCol>
                      </div>
                    </div>
                  </CCol>
                  <br />

                  <h5>HÌNH PHỤ SẢN PHẨM </h5>
                  <div className="bg-white border p-3 position-relative">
                    {selectedIndexes.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '8px',
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          width: '100%',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 10,
                        }}
                      >
                        <CButton
                          color="danger"
                          className="text-white"
                          onClick={removeSelectedImages}
                        >
                          Xóa ảnh đã chọn ({selectedIndexes.length})
                        </CButton>
                      </div>
                    )}
                    <CCol>
                      <CFormInput
                        type="file"
                        id="formFile"
                        label="Chọn hình ảnh phụ (*Có thể chọn nhiều hình cùng lúc)"
                        multiple
                        onChange={(e) => onFileChangeDetail(e)}
                        size="sm"
                      />
                      <br />

                      <div
                        className="d-flex flex-wrap gap-5 p-2 "
                        style={{ maxHeight: 400, overflowY: 'auto' }}
                      >
                        {fileDetail.map((item, index) => {
                          const isSelected = selectedIndexes.includes(index)
                          return (
                            <div key={index} className="position-relative" style={{ width: 130 }}>
                              <div className="d-flex align-items-start gap-2">
                                <CFormCheck
                                  checked={isSelected}
                                  onChange={() => toggleSelect(index)}
                                  style={{
                                    marginTop: 10,
                                    transform: 'scale(1.5)',
                                    accentColor: '#198754',
                                  }}
                                />
                                <CImage
                                  className="border "
                                  src={item}
                                  fluid
                                  style={{
                                    aspectRatio: '1/1',
                                    objectFit: 'cover',
                                    border: isSelected ? '3px solid #198754' : '1px solid #dee2e6',
                                    opacity: isSelected ? 0.8 : 1,
                                    transition: 'all 0.2s ease-in-out',
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CCol>
                  </div>

                  <br />
                  <h6>Search Engine Optimization</h6>

                  <div className="border p-3 bg-white rounded">
                    <CCol md={12}>
                      <label htmlFor="friendlyUrl-input">Chuỗi đường dẫn</label>
                      <FastField
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
                      <label htmlFor="pageTitle-input">Tiêu đề trang</label>
                      <FastField
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
                      <label htmlFor="metaKeywords-input">Meta keywords</label>
                      <FastField
                        name="metaKeywords"
                        type="text"
                        as={CFormTextarea}
                        id="metaKeywords-input"
                        text="Độ dài của meta keywords chuẩn là từ 100 đến 150 ký tự, trong đó có ít nhất 4 dấu phẩy (,)."
                      />
                      <ErrorMessage name="metaKeywords" component="div" className="text-danger" />
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="metaDescription-input">Meta description</label>
                      <FastField
                        name="metaDescription"
                        type="text"
                        as={CFormTextarea}
                        id="metaDescription-input"
                        text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                      />
                      <ErrorMessage
                        name="metaDescription"
                        component="div"
                        className="text-danger"
                      />
                    </CCol>
                  </div>
                  <br />
                </CCol>

                <CCol md={3}>
                  <CCol md={12}>
                    <label htmlFor="syndicationCode-input">Mã Syndication</label>
                    <FastField
                      name="syndicationCode"
                      type="text"
                      as={CFormInput}
                      id="syndicationCode-input"
                    />
                    <ErrorMessage name="syndicationCode" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="productCode-input">Mã kho</label>
                    <FastField
                      name="productCode"
                      type="text"
                      as={CFormInput}
                      id="productCode-input"
                      text="Nếu không nhập mã kho hoặc mã kho đã tồn tại. Hệ thống sẽ tự tạo mã kho theo chuẩn."
                    />
                    <ErrorMessage name="productCode" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <FastField name="marketPrice">
                      {({ field }) => (
                        <CFormInput
                          {...field}
                          type="text"
                          id="marketPrice-input"
                          value={formatNumber(field.value)}
                          label="Giá thị trường (VNĐ)"
                          onChange={(e) => {
                            const rawValue = unformatNumber(e.target.value)
                            setFieldValue(field.name, rawValue)
                          }}
                        />
                      )}
                    </FastField>
                    <ErrorMessage name="marketPrice" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <FastField name="price">
                      {({ field }) => (
                        <CFormInput
                          {...field}
                          type="text"
                          id="price-input"
                          value={formatNumber(field.value)}
                          label="Giá bán (VNĐ)"
                          onChange={(e) => {
                            const rawValue = unformatNumber(e.target.value)
                            setFieldValue(field.name, rawValue)
                          }}
                        />
                      )}
                    </FastField>
                    <ErrorMessage name="price" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="categories-select">Ngành hàng</label>
                    <Field
                      name="categories"
                      as={CFormSelect}
                      id="categories-select"
                      className="select-input"
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                      options={
                        categories && categories.length > 0
                          ? categories.map((cate) => ({
                              label: cate?.category_desc?.cat_name,
                              value: cate.cat_id,
                            }))
                          : []
                      }
                    />
                  </CCol>
                  <br />

                  <div
                    className="border p-3 bg-white"
                    style={{
                      maxHeight: 400,
                      minHeight: 250,
                      overflowY: 'scroll',
                    }}
                  >
                    <React.Fragment>
                      <strong>Danh mục sản phẩm</strong>
                      <div
                        className="mt-2"
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {categories &&
                          categories.length > 0 &&
                          categories
                            ?.filter((cate) => cate.cat_id == industryCategory)?.[0]
                            ?.parenty.map((subCate) => (
                              <>
                                <CFormCheck
                                  style={{
                                    transform: 'scale(1.5)',
                                    accentColor: '#198754',
                                  }}
                                  key={subCate?.cat_id}
                                  label={subCate?.category_desc?.cat_name}
                                  aria-label="Default select example"
                                  defaultChecked={subCate?.cat_id}
                                  id={`flexCheckDefault_${subCate?.cat_id}`}
                                  value={subCate?.cat_id}
                                  checked={parentCategories.includes(subCate?.cat_id)}
                                  onChange={(e) => {
                                    const cateId = subCate?.cat_id
                                    const isChecked = e.target.checked
                                    if (isChecked) {
                                      setParentCategories([...parentCategories, cateId])
                                    } else {
                                      setParentCategories(
                                        parentCategories.filter((id) => id !== cateId),
                                      )
                                    }
                                  }}
                                />

                                {subCate &&
                                  subCate?.parentx.length > 0 &&
                                  subCate?.parentx.map((childCate) => (
                                    <CFormCheck
                                      style={{
                                        transform: 'scale(1.5)',
                                        accentColor: '#198754',
                                      }}
                                      className="ms-3"
                                      key={childCate?.cat_id}
                                      label={childCate?.category_desc?.cat_name}
                                      aria-label="Default select example"
                                      defaultChecked={childCate?.cat_id}
                                      id={`flexCheckDefault_${childCate?.cat_id}`}
                                      value={childCate?.cat_id}
                                      checked={childCategories.includes(childCate?.cat_id)}
                                      onChange={(e) => {
                                        const cateId = childCate?.cat_id
                                        const isChecked = e.target.checked
                                        if (isChecked) {
                                          setChildCategories([...childCategories, cateId])
                                        } else {
                                          setChildCategories(
                                            childCategories.filter((id) => id !== cateId),
                                          )
                                        }
                                      }}
                                    />
                                  ))}
                              </>
                            ))}
                      </div>
                    </React.Fragment>
                  </div>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="brand-select">Thương hiệu</label>
                    <Field
                      name="brand"
                      as={CFormSelect}
                      id="brand-select"
                      className="select-input"
                      options={
                        brands && brands.length > 0
                          ? brands.map((brand) => ({
                              label: brand?.title,
                              value: brand.brandId,
                            }))
                          : []
                      }
                    />
                    <ErrorMessage name="brand" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="star-input">Đánh giá sản phẩm</label>
                    <FastField
                      name="star"
                      type="number"
                      as={CFormInput}
                      id="star-input"
                      text="Nhập số sao đánh giá mong muốn cho sản phẩm. Số từ 1 -> 5"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="Ví dụ: 4.5"
                    />
                    <ErrorMessage name="star" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="status-select">Trạng thái</label>
                    <Field
                      name="status"
                      as={CFormSelect}
                      id="status-select"
                      className="select-input"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      options={[
                        { label: 'Chọn trạng thái', value: '' },
                        ...(status && status.length > 0
                          ? status.map((item) => ({
                              label: item.name,
                              value: item.status_id,
                            }))
                          : []),
                      ]}
                    />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="stock-select">Tình trạng</label>
                    <Field
                      name="stock"
                      as={CFormSelect}
                      id="stock-select"
                      className="select-input"
                      options={[
                        { label: 'Liên hệ', value: 0 },
                        { label: 'Còn hàng', value: 1 },
                        { label: 'Ngừng kinh doanh', value: 2 },
                      ]}
                    />
                    <ErrorMessage name="stock" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <CFormInput
                      name="picture"
                      type="file"
                      id="formFile"
                      label="Hình ảnh đại diện"
                      onChange={(e) => onFileChange(e)}
                      size="sm"
                    />
                    <br />
                    <ErrorMessage name="picture" component="div" className="text-danger" />

                    <div>
                      {file.length == 0 ? (
                        <div>
                          <CImage className="border" src={`${imageBaseUrl}${selectedFile}`} fluid />
                        </div>
                      ) : (
                        file.map((item, index) => <CImage key={index} src={item} width={200} />)
                      )}
                    </div>
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="visible-select">Đăng sản phẩm</label>
                    <FastField
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
                </CCol>
              </CRow>
            </Form>
          )}
        </Formik>
      </CRow>
    </div>
  )
}

export default AddProductDetail
