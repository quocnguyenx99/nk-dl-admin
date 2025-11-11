import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import vi from 'date-fns/locale/vi'
import { getYear, getMonth } from 'date-fns'

import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import './css/addCoupon.css'

import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

function AddCoupon() {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    releaseCode: '',
    startDate: new Date(),
    endDate: new Date(),
    desc: '',
    applyCodeType: '0',
    ordersHaveProductCode: '',
    promotionValue: '',
    maximumUsed: '',
    usedPerCustomer: '',
    termsOfOders: '',
    industry: 'all',
    applyToProductCategories: [],
    applytoProductBrand: [],
    numberOfCodes: '1',
    prefixCode: 'NK',
    suffixCode: 'CP',
    characterCode: '4',
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

  const fetchBrandData = async () => {
    try {
      const response = await axiosClient.get('admin/brand')
      if ((response.data.status = true)) {
        setBrands(response.data.list)
      }
    } catch (error) {
      console.error('Fetch brands data error', error)
    }
  }

  useEffect(() => {
    fetchBrandData()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/coupon', {
        TenCoupon: values.title,
        MaPhatHanh: values.releaseCode,
        StartCouponDate: values.startDate,
        EndCouponDate: values.endDate,
        DesCoupon: values.desc,
        type: values.applyCodeType,
        MaKhoSPApdung: values.ordersHaveProductCode,
        GiaTriCoupon: values.promotionValue,
        SoLanSuDung: values.maximumUsed,
        KHSuDungToiDa: values.usedPerCustomer,
        DonHangChapNhanTu: values.termsOfOders,
        DanhMucSpChoPhep: values.applyToProductCategories,
        ThuongHieuSPApDung: values.applytoProductBrand,
        SoLuongMa: values.numberOfCodes,
        number: values.characterCode,
        prefix: values.prefixCode,
        suffixes: values.suffixCode,
        status_id: values.visible,
        cat_parent_id: [values.industry],
      })
      if (response.data.status === true) {
        toast.success('Thêm mới coupon thành công')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Add coupon data is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  const years = React.useMemo(() => {
    const end = getYear(new Date())
    return Array.from({ length: end - 1990 + 1 }, (_, i) => 1990 + i)
  }, [])
  const months = React.useMemo(
    () => [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ],
    [],
  )

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <h3>THÊM ĐỢT PHÁT HÀNH</h3>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={`/coupon`}>
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
            {({ setFieldValue, values }) => (
              <Form>
                <CCol md={12}>
                  <label htmlFor="title-input">Tên đợt phát hành</label>
                  <Field
                    name="title"
                    type="text"
                    as={CFormInput}
                    id="title-input"
                    text="Tối thiểu 6 ký tự."
                  />
                  <ErrorMessage name="title" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="releaseCode-input">Mã đợt phát hành</label>
                  <Field
                    name="releaseCode"
                    type="text"
                    as={CFormInput}
                    id="releaseCode-input"
                    text="Tối thiểu 6 ký tự. VD:COUPONDOT001"
                  />
                  <ErrorMessage name="releaseCode" component="div" className="text-danger" />
                </CCol>
                <br />

                <div>
                  <label>Thời gian áp dụng từ</label>
                  <div className="d-flex align-items-center mb-2">
                    <DatePicker
                      dateFormat={'dd-MM-yyyy'}
                      showIcon
                      selected={values.startDate}
                      onChange={(date) => setFieldValue('startDate', date)}
                      locale="vi"
                      renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div
                          style={{
                            margin: 10,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            type="button"
                            className="react-datepicker__navigation react-datepicker__navigation--previous"
                          >
                            {'<'}
                          </button>
                          <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(parseInt(value, 10))}
                          >
                            {years.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <select
                            value={months[getMonth(date)]}
                            onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                          >
                            {months.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            type="button"
                            className="react-datepicker__navigation react-datepicker__navigation--next"
                          >
                            {'>'}
                          </button>
                        </div>
                      )}
                    />
                    <p className="m-2">{'đến ngày'}</p>
                    <DatePicker
                      dateFormat={'dd-MM-yyyy'}
                      showIcon
                      selected={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      locale="vi"
                      renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled,
                      }) => (
                        <div
                          style={{
                            margin: 10,
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            type="button"
                            className="react-datepicker__navigation react-datepicker__navigation--previous"
                          >
                            {'<'}
                          </button>
                          <select
                            value={getYear(date)}
                            onChange={({ target: { value } }) => changeYear(parseInt(value, 10))}
                          >
                            {years.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <select
                            value={months[getMonth(date)]}
                            onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                          >
                            {months.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            type="button"
                            className="react-datepicker__navigation react-datepicker__navigation--next"
                          >
                            {'>'}
                          </button>
                        </div>
                      )}
                    />
                  </div>
                  <ErrorMessage name="startDate" component="p" className="text-danger" />
                  <ErrorMessage name="endDate" component="p" className="text-danger" />
                </div>
                <br />

                <CCol md={12}>
                  <label htmlFor="desc-input">Mô tả</label>
                  <Field
                    style={{ height: '100px' }}
                    name="desc"
                    type="text"
                    as={CFormTextarea}
                    id="desc-input"
                  />
                  <ErrorMessage name="desc" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="applyCode-select">Loại Mã áp dụng</label>
                  <Field
                    name="applyCodeType"
                    as={CFormSelect}
                    id="applyCode-select"
                    className="select-input"
                    options={[
                      { label: 'Giảm Tổng Đơn Hàng', value: '0' },
                      { label: 'Giảm Theo Mã Hàng', value: '1' },
                    ]}
                  />
                  <ErrorMessage name="applyCodeType" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="productCode-input">Đơn hàng có Mã SP</label>
                  <Field
                    name="ordersHaveProductCode"
                    type="text"
                    as={CFormInput}
                    id="productCode-input"
                    text={`Nhập Mã Kho SP Cách nhau dấu "," VD: MBDE_3080SFF,MBDE_3456SSS`}
                    disabled={values.applyCodeType == '0' ? true : false}
                  />
                  <ErrorMessage
                    name="ordersHaveProductCode"
                    component="div"
                    className="text-danger"
                  />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="promotion-input">Giá trị khuyến mãi</label>
                  <Field
                    name="promotionValue"
                    type="text"
                    as={CFormInput}
                    id="promotion-input"
                    text="Chỉ nhập số. VD:10,000"
                  />
                  <ErrorMessage name="promotionValue" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="maximumUsed-input">Mỗi mã được sử dụng tối đa</label>
                  <Field
                    name="maximumUsed"
                    type="text"
                    as={CFormInput}
                    id="maximumUsed-input"
                    text="Chỉ nhập số. VD:10 - Nhập 999999 -> không giới hạn số lần"
                  />
                  <ErrorMessage name="maximumUsed" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="usedPerCustomer-input">
                    Trong đó mỗi khách hàng được sử dụng tối đa
                  </label>
                  <Field
                    name="usedPerCustomer"
                    type="text"
                    as={CFormInput}
                    id="usedPerCustomer-input"
                    text="Chỉ nhập số. VD:10 - Nhập 999999 -> không giới hạn số lần"
                  />
                  <ErrorMessage name="usedPerCustomer" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="termsOfOders-input">Điều kiện đơn hàng từ</label>
                  <Field
                    name="termsOfOders"
                    type="text"
                    as={CFormInput}
                    id="termsOfOders-input"
                    text="Chỉ nhập số. VD:1,000,000 - Nhập 0 -> không giới hạn giá trị đơn hàng"
                  />
                  <ErrorMessage name="termsOfOders" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <CCol md={12}>
                    <label htmlFor="industry-select">Áp dụng cho danh mục sản phẩm</label>
                    <p>Ngành hàng (Nếu dùng chung chọn [tất cả] !)</p>
                    <Field
                      className="component-size w-50"
                      name="industry"
                      as={CFormSelect}
                      id="industry-select"
                      options={[
                        { label: 'Tất cả', value: 'all' },
                        ...(categories && categories.length > 0
                          ? categories?.map((item) => ({
                              label: item.category_desc?.cat_name,
                              value: item?.parenty?.map((sub) => sub.cat_id),
                            }))
                          : []),
                      ]}
                    />
                    <ErrorMessage name="industry" component="div" className="text-danger" />
                  </CCol>
                  <br />
                  <CCol md={12} className="overflow-scroll" style={{ height: 'auto' }}>
                    {categories?.map((category) => (
                      <div key={category?.cat_id}>
                        {category?.parenty &&
                          category?.parenty
                            .filter((item) => {
                              const industryArr = values.industry.split(',')
                              return industryArr.includes(item.cat_id.toString())
                            })
                            .map((child) => (
                              <div key={child.cat_id} className="ms-3 d-flex">
                                <img
                                  src="https://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif"
                                  alt="Subcategory"
                                  className="mr-2"
                                />
                                <CFormCheck
                                  id={child.cat_id}
                                  label={child?.category_desc?.cat_name}
                                  value={child.cat_id}
                                  checked={values.applyToProductCategories.includes(child.cat_id)}
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
                    <ErrorMessage
                      name="applyToProductCategories"
                      component="div"
                      className="text-danger"
                    />
                  </CCol>
                </CCol>
                <br />

                {/* <CFormLabel>Đơn hàng có thương hiệu sản phẩm</CFormLabel>
                <CCol md={12} className="overflow-scroll" style={{ height: '300px' }}>
                  {brands && brands.length > 0
                    ? brands.map((brand) => (
                        <div key={brand.brandId}>
                          <CFormCheck
                            id={brand.brandId}
                            label={brand?.title}
                            value={brand.brandId}
                            checked={values.applytoProductBrand.includes(brand.brandId)}
                            onChange={() => {
                              const set = new Set(values.applytoProductBrand)
                              if (set.has(brand.brandId)) {
                                set.delete(brand.brandId)
                              } else {
                                set.add(brand.brandId)
                              }
                              setFieldValue('applytoProductBrand', Array.from(set))
                            }}
                          />
                        </div>
                      ))
                    : 'Không có thương hiệu để lựa chọn'}
                  <ErrorMessage
                    name="applytoProductBrand"
                    component="div"
                    className="text-danger"
                  />
                </CCol> */}

                <CCol md={12}>
                  <label htmlFor="numberOfCodes-input">Số Lượng Mã Cần Tạo</label>
                  <Field
                    name="numberOfCodes"
                    type="text"
                    as={CFormInput}
                    id="numberOfCodes-input"
                    text="Chỉ nhập số. VD:10 - tối đa 500"
                  />
                  <ErrorMessage name="numberOfCodes" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="prefixCode-input">Mã Tiền Tố</label>
                  <Field
                    name="prefixCode"
                    type="text"
                    as={CFormInput}
                    id="prefixCode-input"
                    text="Là giá trị phía trước mã . VD: ABC_____ - tối đa 3 ký tự"
                  />
                  <ErrorMessage name="prefixCode" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="suffixCode-input">Mã Hậu Tố</label>
                  <Field
                    name="suffixCode"
                    type="text"
                    as={CFormInput}
                    id="suffixCode-input"
                    text="Là giá trị phía sau cùng dãy mã . VD: _____END - tối đa 3 ký tự"
                  />
                  <ErrorMessage name="suffixCode" component="div" className="text-danger" />
                </CCol>
                <br />

                <CCol md={12}>
                  <label htmlFor="characterCode-input">Số ký tự mã</label>
                  <Field
                    name="characterCode"
                    type="text"
                    as={CFormInput}
                    id="characterCode-input"
                    text="Là số lượng ký tự [ngẫu nhiên] cho dãy mã . VD: __XxXxXx___ - nhập giá trị 1-6"
                  />
                  <ErrorMessage name="characterCode" component="div" className="text-danger" />
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
                      { label: 'Không', value: 2 },
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

export default AddCoupon
