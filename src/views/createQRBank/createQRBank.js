import React from 'react'
import { CImage } from '@coreui/react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import './public/QRCodeOrderPage.css'

import LogoNK from '../../assets/images/logo/logo NK.png'
import qrIamges from '../../assets/images/qr-phieu-xuat.png'

const orderItems = [
  {
    name: 'NOTEBOOK',
    price: 9981818,
    quantity: 1,
    total: 9981818,
  },
  {
    name: '[A2NL7PA] NB HP 15-FD0306TU/CORE I3-1315U/8GB RAM/256GB SSD/INTEL GRAPHICS...',
    price: 0,
    quantity: 1,
    total: 0,
  },
  {
    name: 'Ổ CỨNG SSD SILICON (SOLID STATE DISK) M.2 2280 PCIE SSD A60,512GB,STD SP512GBP34A60M28',
    price: 0,
    quantity: 1,
    total: 0,
  },
  {
    name: 'Túi laptop 15 inch',
    price: 0,
    quantity: 1,
    total: 0,
  },
]

const orderSummary = {
  totalQuantity: 4,
  totalAmount: 10980000,
}

const QRCodeOrderPage = () => {
  // Schema validation
  const SearchSchema = Yup.object().shape({
    mapx: Yup.string().required('Vui lòng nhập mã phiếu xuất'),
  })

  const handleSearch = (values) => {
    console.log('Giá trị nhập:', values.mapx)
  }

  return (
    <div className="qrcode-wrapper">
      <div className="qrcode-header no-print">
        <CImage src={LogoNK} className="qrcode-header__logo" alt="Logo" width={100} />
        <h3 className="qrcode-header__title">Tạo mã QR Thanh toán cho đơn hàng NKC</h3>
      </div>
      <div className="qrcode-body">
        <div className="qrcode-body__form-layout no-print">
          <h4 className="qrcode-body__form-title">Nhập mã phiếu xuất đơn hàng</h4>
          <Formik
            initialValues={{ mapx: '' }}
            validationSchema={SearchSchema}
            onSubmit={handleSearch}
          >
            {({ errors, touched }) => (
              <Form className="qrcode-body__form">
                <div className="qrcode-body__input-group">
                  <div className="qrcode-body__input-container">
                    <input type="text" name="mapx" placeholder=" " className="qrcode-body__input" />
                    <label htmlFor="mapx" className="qrcode-body__label">
                      Nhập mã phiếu xuất
                    </label>
                  </div>
                  {errors.mapx && touched.mapx ? (
                    <div className="qrcode-body__error">
                      <span className="qrcode-body__error-icon">⚠️</span>
                      {errors.mapx}
                    </div>
                  ) : null}
                  <button type="submit" className="qrcode-body__button">
                    TẠO MÃ QR
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="qrcode-body__content-layout">
          <div className="qrcode-body__order-qrcode">
            <h4 className="qrcode-body__order-qrcode-title">
              Mã QR cho phiếu xuất{' '}
              <span className="qrcode-body__order-qrcode-title--red">X250426023-N</span>
            </h4>
            <p>Sử dụng app ngân hàng hoặc ứng dụng camera hỗ trợ QR code để quét mã</p>
            <CImage src={qrIamges} alt={'Ảnh qrcode thanh toán'} />
            <div className="order-qrcode__order-detail">
              <div className="order-qrcode__detail-row">
                <span className="order-qrcode__label">Ngân hàng thụ hưởng</span>
                <span className="order-qrcode__value">ACB</span>
              </div>
              <div className="order-qrcode__detail-row">
                <span className="order-qrcode__label">Số tài khoản</span>
                <span className="order-qrcode__value">9698891059</span>
              </div>
              <div className="order-qrcode__detail-row">
                <span className="order-qrcode__label">Đơn vị thụ hưởng</span>
                <span className="order-qrcode__value">Công ty TNHH Vi Tính Nguyên Kim</span>
              </div>
              <div className="order-qrcode__detail-row">
                <span className="order-qrcode__label">Số tiền thanh toán</span>
                <span className="order-qrcode__value order-qrcode__value--amount">
                  10.980.000 ₫
                </span>
              </div>
            </div>
          </div>
          <div className="qrcode-body__order-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Thông tin đơn hàng</h4>
              <button className="qrcode-body__order-info-print" onClick={() => window.print()}>
                In mã QR
              </button>
            </div>
            <div className="qrcode-body__order-info-content">
              <p>
                <strong>Khách Hàng:</strong> CÔNG TY TRÁCH NHIỆM HỮU HẠN VI TÍNH TOÀN PHÚC
                <br />
                <span>
                  (Liên hệ: <strong>MR TOÀN</strong> SĐT: 0963676076)
                </span>
              </p>
              <p>
                <strong>MST:</strong> 2100670996
              </p>
              <p>
                <strong>Địa Chỉ Trụ Sở:</strong> SỐ 108 KIÊN THỊ NHÂN, PHƯỜNG 7, THÀNH PHỐ TRÀ VINH,
                TỈNH TRÀ VINH, VIỆT NAM
              </p>
              <p>
                <strong>Địa Chỉ Giao Hàng:</strong> Chành xe Thanh Thủy : 274 Trần Phú, P8, Quận 5
                (SĐT: 02836368458)
              </p>
              <p>
                <strong>Ghi Chú:</strong> A Toàn - 0963676076 đặt hàng - GH chở cf GH
              </p>
            </div>

            <div className="order-details">
              <h4 className="order-details__title">Chi tiết đơn hàng</h4>
              <div className="order-details__items">
                {Array.isArray(orderItems) &&
                  orderItems.length > 0 &&
                  orderItems.map((item, index) => (
                    <div key={index} className="order-details__item">
                      <div className="order-details__item-name">{item.name}</div>
                      <div className="order-details__item-info">
                        <span className="order-details__item-price">
                          {item.price.toLocaleString()} đ
                        </span>
                        <span className="order-details__item-quantity"> x {item.quantity}</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="order-details__divider"></div>
              <div className="order-details__summary">
                <div className="order-details__summary-item">
                  <span className="order-details__summary-label">Tổng số lượng:</span>
                  <span className="order-details__summary-value">{orderSummary.totalQuantity}</span>
                </div>
                <div className="order-details__summary-item">
                  <span className="order-details__summary-label">Tổng tiền thanh toán đã VAT:</span>
                  <span className="order-details__summary-value">
                    {orderSummary.totalAmount.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeOrderPage
