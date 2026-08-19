import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Link, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilPlus } from '@coreui/icons'

import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { unformatNumber, formatNumber } from '../../../helper/utils'

import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'

function AddPromotionDetail() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [editorData, setEditorData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    releaseCode: '',
    startDate: new Date(),
    endDate: new Date(),
    minPrice: 0,
    maxPrice: 0,
    applyGiftType: 0,
    industry: 'all',
    applyToProductCategories: [],
    ordersHaveProductCode: '',
    visible: 1,
  }

  const validationSchema = Yup.object({
    title: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Tên đợt phát hành là bắt buộc.'),
    releaseCode: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Mã đợt phát hành là bắt buộc'),
    startDate: Yup.date().required('Thời gian bắt đầu là bắt buộc.'),
    endDate: Yup.date()
      .required('Thời gian kết thúc là bắt buộc.')
      .test('is-greater', 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu!', function (value) {
        const { startDate } = this.parent
        return value && startDate ? value > startDate : true
      }),
  })

  const fetchCategoriesData = async () => {
    try {
      const response = await axiosClient.get('admin/category')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Fetch categories data error', error)
    }
  }

  useEffect(() => {
    fetchCategoriesData()
  }, [])

  const handleSubmit = async (values) => {
    setIsLoading(true)
    try {
      const response = await axiosClient.post('admin/gift-promotion', {
        title: values.title,
        code: values.releaseCode,
        cat_parent_id: String(values.industry).split(','),
        list_cat: values.applyToProductCategories,
        list_product: values.ordersHaveProductCode,
        content: editorData,
        type: values.applyGiftType,
        display: values.visible,
        priceMin: values.minPrice,
        priceMax: values.maxPrice,
        StartDate: values.startDate,
        EndDate: values.endDate,
      })

      if (response.data.status === true) {
        toast.success('Thêm mới chương trình khuyến mãi thành công!')
        navigate('/promotion-detail')
      } else {
        toast.error(response.data.message || 'Thêm mới thất bại!')
      }
    } catch (error) {
      console.error('Post gift data error', error)
      toast.error('Đã xảy ra lỗi khi tạo mới!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditorChange = (data) => {
    setEditorData(data)
  }

  return (
    <div>
      {/* Header Title & Actions */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">THÊM MỚI CHƯƠNG TRÌNH KHUYẾN MÃI</h4>
          <p className="text-muted small mb-0">
            Tạo đợt phát hành khuyến mãi, quà tặng mới cho cửa hàng
          </p>
        </div>
        <div>
          <CButton
            color="secondary"
            variant="outline"
            className="fw-semibold d-flex align-items-center gap-1"
            onClick={() => navigate('/promotion-detail')}
          >
            <CIcon icon={cilArrowLeft} /> Quay lại danh sách
          </CButton>
        </div>
      </div>

      <CRow>
        <CCol lg={10} md={12} className="mx-auto">
          <CCard className="shadow-xs border mb-4">
            <CCardHeader className="bg-primary text-white py-2 px-3 fw-bold">
              Thông tin khuyến mãi & quà tặng mới
            </CCardHeader>
            <CCardBody className="p-4">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, values }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="title-input" className="form-label fw-semibold text-dark">
                        Tên đợt phát hành <span className="text-danger">*</span>
                      </label>
                      <Field
                        name="title"
                        type="text"
                        as={CFormInput}
                        id="title-input"
                        placeholder="Nhập tên đợt khuyến mãi..."
                      />
                      <div className="form-text text-muted small">Tối thiểu 6 ký tự.</div>
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="releaseCode-input"
                        className="form-label fw-semibold text-dark"
                      >
                        Mã đợt phát hành <span className="text-danger">*</span>
                      </label>
                      <Field
                        name="releaseCode"
                        type="text"
                        as={CFormInput}
                        id="releaseCode-input"
                        placeholder="VD: 160724_quatang_laptop"
                      />
                      <div className="form-text text-muted small">
                        Mã duy nhất phân biệt các chương trình.
                      </div>
                      <ErrorMessage
                        name="releaseCode"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark mb-1">
                        Thời gian áp dụng <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <DatePicker
                          className="form-control"
                          dateFormat={'dd-MM-yyyy'}
                          showIcon
                          selected={values.startDate}
                          onChange={(date) => setFieldValue('startDate', date)}
                        />
                        <span className="fw-semibold text-secondary">đến ngày</span>
                        <DatePicker
                          className="form-control"
                          dateFormat={'dd-MM-yyyy'}
                          showIcon
                          selected={values.endDate}
                          onChange={(date) => setFieldValue('endDate', date)}
                        />
                      </div>
                      <ErrorMessage
                        name="startDate"
                        component="div"
                        className="text-danger small mt-1"
                      />
                      <ErrorMessage
                        name="endDate"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="mb-3">
                      <CFormLabel className="fw-semibold text-dark">
                        Khoảng giá áp dụng (VNĐ)
                      </CFormLabel>
                      <CRow className="g-2">
                        <CCol md={6}>
                          <label className="form-label text-secondary small mb-1">
                            Giá tối thiểu
                          </label>
                          <Field name="minPrice">
                            {({ field }) => (
                              <CFormInput
                                {...field}
                                type="text"
                                id="minPrice-input"
                                value={formatNumber(field.value)}
                                onChange={(e) => {
                                  const rawValue = unformatNumber(e.target.value)
                                  setFieldValue(field.name, rawValue)
                                }}
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="minPrice"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </CCol>

                        <CCol md={6}>
                          <label className="form-label text-secondary small mb-1">Giá tối đa</label>
                          <Field name="maxPrice">
                            {({ field }) => (
                              <CFormInput
                                {...field}
                                type="text"
                                id="maxPrice-input"
                                value={formatNumber(field.value)}
                                onChange={(e) => {
                                  const rawValue = unformatNumber(e.target.value)
                                  setFieldValue(field.name, rawValue)
                                }}
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="maxPrice"
                            component="div"
                            className="text-danger small mt-1"
                          />
                        </CCol>
                      </CRow>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="desc-input" className="form-label fw-semibold text-dark">
                        Nội dung chi tiết quà tặng & điều kiện
                      </label>
                      <CKedtiorCustom data={editorData} onChangeData={handleEditorChange} />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="applyGiftType-select"
                        className="form-label fw-semibold text-dark"
                      >
                        Loại đối tượng áp dụng quà tặng
                      </label>
                      <Field
                        name="applyGiftType"
                        as={CFormSelect}
                        id="applyGiftType-select"
                        options={[
                          { label: 'Áp dụng cho ngành hàng', value: 0 },
                          { label: 'Áp dụng cho Mã SP chỉ định', value: 1 },
                        ]}
                        onChange={(e) => setFieldValue('applyGiftType', Number(e.target.value))}
                      />
                      <ErrorMessage
                        name="applyGiftType"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    {Number(values.applyGiftType) === 1 && (
                      <div className="mb-3 p-3 bg-light rounded-2 border">
                        <label
                          htmlFor="productCode-input"
                          className="form-label fw-semibold text-dark"
                        >
                          Đơn hàng có Mã SP chỉ định
                        </label>
                        <Field
                          name="ordersHaveProductCode"
                          type="text"
                          as={CFormInput}
                          id="productCode-input"
                          placeholder="VD: MBDE_3080SFF, MBDE_3456SSS"
                        />
                        <div className="form-text text-muted small">
                          Nhập các Mã Kho SP cách nhau bởi dấu phẩy ","
                        </div>
                        <ErrorMessage
                          name="ordersHaveProductCode"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                    )}

                    {Number(values.applyGiftType) === 0 && (
                      <div className="mb-3 p-3 bg-light rounded-2 border">
                        <label
                          htmlFor="industry-select"
                          className="form-label fw-semibold text-dark"
                        >
                          Áp dụng cho danh mục ngành hàng
                        </label>
                        <p className="small text-muted mb-2">
                          Chọn Ngành hàng (Chọn [Tất cả] nếu áp dụng toàn hệ thống)
                        </p>
                        <Field
                          className="w-50 mb-3"
                          name="industry"
                          as={CFormSelect}
                          id="industry-select"
                          options={[
                            { label: 'Tất cả ngành hàng', value: 'all' },
                            ...categories?.map((item) => ({
                              label: item.category_desc?.cat_name,
                              value: item.parenty
                                ? item.parenty.map((sub) => sub.cat_id).join(',')
                                : item.cat_id,
                            })),
                          ]}
                        />
                        <ErrorMessage
                          name="industry"
                          component="div"
                          className="text-danger small mt-1"
                        />

                        <div
                          className="overflow-auto border rounded p-2 bg-white"
                          style={{ maxHeight: '250px' }}
                        >
                          {categories.map((category) => (
                            <div key={category?.cat_id}>
                              {category?.parenty &&
                                category?.parenty
                                  .filter((item) => {
                                    const industryArr = String(values.industry).split(',')
                                    return (
                                      values.industry === 'all' ||
                                      industryArr.includes(item.cat_id.toString())
                                    )
                                  })
                                  .map((child) => (
                                    <div
                                      key={child.cat_id}
                                      className="ms-3 my-1 d-flex align-items-center gap-2"
                                    >
                                      <CFormCheck
                                        id={`cat_${child.cat_id}`}
                                        label={child?.category_desc?.cat_name}
                                        value={child.cat_id}
                                        checked={values.applyToProductCategories.includes(
                                          child.cat_id,
                                        )}
                                        onChange={() => {
                                          const set = new Set(values.applyToProductCategories)
                                          if (set.has(child.cat_id)) {
                                            set.delete(child.cat_id)
                                          } else {
                                            set.add(child.cat_id)
                                          }
                                          setFieldValue('applyToProductCategories', Array.from(set))
                                        }}
                                      />
                                    </div>
                                  ))}
                            </div>
                          ))}
                        </div>
                        <ErrorMessage
                          name="applyToProductCategories"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="visible-select" className="form-label fw-semibold text-dark">
                        Trạng thái hiển thị
                      </label>
                      <Field
                        name="visible"
                        as={CFormSelect}
                        id="visible-select"
                        options={[
                          { label: 'Đang ẩn', value: 0 },
                          { label: 'Hiển thị', value: 1 },
                        ]}
                      />
                      <ErrorMessage
                        name="visible"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2 border-top pt-3">
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/promotion-detail')}
                      >
                        Hủy bỏ
                      </CButton>
                      <CButton
                        color="primary"
                        type="submit"
                        size="sm"
                        className="fw-semibold px-4"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <CSpinner size="sm" /> Đang thêm mới...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilPlus} /> Thêm mới
                          </>
                        )}
                      </CButton>
                    </div>
                  </Form>
                )}
              </Formik>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default AddPromotionDetail
