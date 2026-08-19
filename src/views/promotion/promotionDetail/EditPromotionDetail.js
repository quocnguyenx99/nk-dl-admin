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
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'

import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { formatNumber } from 'chart.js/helpers'
import { unformatNumber } from '../../../helper/utils'
import moment from 'moment'
import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'

function EditPromotionDetail() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [editorData, setEditorData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const initialValues = {
    title: '',
    releaseCode: '',
    startDate: new Date(),
    endDate: new Date(),
    minPrice: 0,
    maxPrice: 0,
    applyGiftType: 0,
    industry: '1',
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

    minPrice: Yup.number()
      .required('Bắt buộc')
      .positive('Giá phải lớn hơn 0')
      .integer('Giá phải là số nguyên'),
    maxPrice: Yup.number()
      .required('Bắt buộc')
      .positive('Giá phải lớn hơn 0')
      .integer('Giá phải là số nguyên')
      .moreThan(Yup.ref('minPrice'), 'Giá sau phải lớn hơn giá trước'),
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

  const fetchDataGiftPromotion = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/gift-promotion/${id}/edit`)
      const data = response.data.data

      if (data && response.data.status === true) {
        setEditorData(data.content)
        setValues({
          title: data.title,
          releaseCode: data.code,
          minPrice: data.priceMin,
          maxPrice: data.priceMax,
          startDate:
            data.StartDate && Number(data.StartDate) > 0
              ? new Date(moment.unix(data.StartDate))
              : new Date(),
          endDate:
            data.EndDate && Number(data.EndDate) > 0
              ? new Date(moment.unix(data.EndDate))
              : new Date(),
          applyGiftType: data.type,
          ordersHaveProductCode: data.ordersHaveProductCode,
          industry: data.cat_parent_id,
          visible: data.display,
          applyToProductCategories: data.list_cat || [],
        })
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data gift error', error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/gift-promotion/${id}`, {
        title: values.title,
        code: values.releaseCode,
        cat_parent_id: [values.industry],
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
        toast.success('Cập nhật khuyến mãi thành công!')
        navigate('/promotion-detail')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post gift data error', error)
      toast.error('Đã xảy ra lỗi! Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditorChange = (data) => {
    setEditorData(data)
  }

  return (
    <div>
      {!isPermissionCheck ? (
        <h5 className="p-4 text-center">
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          {/* Header Title & Actions */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">CẬP NHẬT CHƯƠNG TRÌNH KHUYẾN MÃI</h4>
              <p className="text-muted small mb-0">
                Chỉnh sửa thông tin chi tiết đợt khuyến mãi #{id}
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
                  Thông tin khuyến mãi & quà tặng
                </CCardHeader>
                <CCardBody className="p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ setFieldValue, values, setValues }) => {
                      useEffect(() => {
                        fetchDataGiftPromotion(setValues)
                      }, [setValues])

                      return (
                        <Form>
                          <div className="mb-3">
                            <label
                              htmlFor="title-input"
                              className="form-label fw-semibold text-dark"
                            >
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
                              Khoảng giá áp dụng (VNĐ) <span className="text-danger">*</span>
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
                                <label className="form-label text-secondary small mb-1">
                                  Giá tối đa
                                </label>
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
                            <label
                              htmlFor="desc-input"
                              className="form-label fw-semibold text-dark"
                            >
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
                                { label: 'Áp dụng cho ngành hàng', value: '0' },
                                { label: 'Áp dụng cho Mã SP chỉ định', value: '1' },
                              ]}
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
                                                setFieldValue(
                                                  'applyToProductCategories',
                                                  Array.from(set),
                                                )
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
                            <label
                              htmlFor="visible-select"
                              className="form-label fw-semibold text-dark"
                            >
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
                                  <CSpinner size="sm" /> Đang lưu...
                                </>
                              ) : (
                                <>
                                  <CIcon icon={cilSave} /> Lưu cập nhật
                                </>
                              )}
                            </CButton>
                          </div>
                        </Form>
                      )
                    }}
                  </Formik>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default EditPromotionDetail
