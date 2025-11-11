import { cilBan, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CRow,
  CTable,
  CTooltip,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import moment from 'moment/moment'

function LinkManagement() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [dataLinks, setDataLinks] = useState([])

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [selectedCategory, setSelectedCategory] = useState('All')

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  const [isCollapse, setIsCollapse] = useState(false)
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // Sample data for testing
  const sampleDataLinks = {
    data: [
      {
        news_id: 1,
        slug: 'gioi-thieu-cong-ty',
        module: 'About',
        action: 'View',
        itemId: 101,
        date: 1714630800,
      },
      {
        news_id: 2,
        slug: 'tin-tuc-moi-nhat',
        module: 'News',
        action: 'Edit',
        itemId: 102,
        date: 1714544400,
      },
      {
        news_id: 3,
        slug: 'chi-tiet-san-pham-a',
        module: 'Product',
        action: 'Delete',
        itemId: 103,
        date: 1714458000,
      },
      {
        news_id: 4,
        slug: 'huong-dan-su-dung',
        module: 'Guide',
        action: 'View',
        itemId: 201,
        date: 1714371600,
      },
      {
        news_id: 5,
        slug: 'blog-cong-nghe-moi',
        module: 'Blog',
        action: 'Publish',
        itemId: 301,
        date: 1714285200,
      },
      {
        news_id: 6,
        slug: 'lien-he-chung-toi',
        module: 'Contact',
        action: 'View',
        itemId: 401,
        date: 1714198800,
      },
      {
        news_id: 7,
        slug: 'danh-muc-san-pham',
        module: 'Category',
        action: 'List',
        itemId: 501,
        date: 1714112400,
      },
      {
        news_id: 8,
        slug: 'profile-nguoi-dung',
        module: 'User',
        action: 'Update',
        itemId: 601,
        date: 1714026000,
      },
      {
        news_id: 9,
        slug: 'don-hang-cua-toi',
        module: 'Order',
        action: 'View',
        itemId: 701,
        date: 1713939600,
      },
      {
        news_id: 10,
        slug: 'them-san-pham-moi',
        module: 'Product',
        action: 'Create',
        itemId: 104,
        date: 1713853200,
      },
      {
        news_id: 11,
        slug: 'cap-nhat-tin-tuc',
        module: 'News',
        action: 'Update',
        itemId: 102,
        date: 1713766800,
      },
      {
        news_id: 12,
        slug: 'xoa-san-pham-b',
        module: 'Product',
        action: 'Delete',
        itemId: 105,
        date: 1713680400,
      },
      {
        news_id: 13,
        slug: 'tim-kiem-nang-cao',
        module: 'Search',
        action: 'Perform',
        itemId: null,
        date: 1713594000,
      },
      {
        news_id: 14,
        slug: 'dang-nhap',
        module: 'Auth',
        action: 'Login',
        itemId: null,
        date: 1713507600,
      },
      {
        news_id: 15,
        slug: 'dang-ky',
        module: 'Auth',
        action: 'Register',
        itemId: null,
        date: 1713421200,
      },
      {
        news_id: 16,
        slug: 'chi-tiet-blog-cu',
        module: 'Blog',
        action: 'View',
        itemId: 302,
        date: 1713334800,
      },
      {
        news_id: 17,
        slug: 'quan-ly-don-hang',
        module: 'Order',
        action: 'List',
        itemId: null,
        date: 1713248400,
      },
      {
        news_id: 18,
        slug: 'sua-thong-tin-cong-ty',
        module: 'About',
        action: 'Edit',
        itemId: 101,
        date: 1713162000,
      },
      {
        news_id: 19,
        slug: 'chi-tiet-san-pham-c',
        module: 'Product',
        action: 'View',
        itemId: 106,
        date: 1713075600,
      },
      {
        news_id: 20,
        slug: 'gui-phan-hoi',
        module: 'Contact',
        action: 'Submit',
        itemId: null,
        date: 1712989200,
      },
      {
        news_id: 21,
        slug: 'xem-tat-ca-tin-tuc',
        module: 'News',
        action: 'List',
        itemId: null,
        date: 1712902800,
      },
      {
        news_id: 22,
        slug: 'them-vao-gio-hang',
        module: 'Cart',
        action: 'Add',
        itemId: 106,
        date: 1712816400,
      },
      {
        news_id: 23,
        slug: 'xem-gio-hang',
        module: 'Cart',
        action: 'View',
        itemId: null,
        date: 1712730000,
      },
      {
        news_id: 24,
        slug: 'thanh-toan',
        module: 'Checkout',
        action: 'Process',
        itemId: null,
        date: 1712643600,
      },
      {
        news_id: 25,
        slug: 'lich-su-mua-hang',
        module: 'Order',
        action: 'History',
        itemId: null,
        date: 1712557200,
      },
      {
        news_id: 26,
        slug: 'cap-nhat-thong-tin-ca-nhan',
        module: 'User',
        action: 'Update',
        itemId: 601,
        date: 1712470800,
      },
      {
        news_id: 27,
        slug: 'xem-danh-muc-moi',
        module: 'Category',
        action: 'View',
        itemId: 502,
        date: 1712384400,
      },
      {
        news_id: 28,
        slug: 'doc-huong-dan-nang-cao',
        module: 'Guide',
        action: 'View',
        itemId: 202,
        date: 1712298000,
      },
      {
        news_id: 29,
        slug: 'viet-bai-blog',
        module: 'Blog',
        action: 'Create',
        itemId: null,
        date: 1712211600,
      },
      {
        news_id: 30,
        slug: 'xem-chi-tiet-don-hang',
        module: 'Order',
        action: 'View',
        itemId: 702,
        date: 1712125200,
      },
    ],
    total: 30,
    per_page: 10,
  }

  // Replace fetchDataLinks with sample data for testing
  const fetchDataLinks = async (dataSearch = '') => {
    try {
      // Simulate API response with sample data
      setDataLinks(sampleDataLinks)
    } catch (error) {
      console.error('Fetch promotion news data is error', error)
    }
  }

  useEffect(() => {
    fetchDataLinks()
  }, [pageNumber, selectedCategory])

  // search Data
  const handleSearch = (keyword) => {
    fetchDataLinks(keyword)
  }

  const handleEditClick = (id, module) => {
    navigate(`/${module}/edit?id=${id}`)
  }

  const handleAction = async (actionType) => {
    if (selectedCheckbox.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục để thực hiện hành động.')
      return
    }

    try {
      setIsLoading(true)
      const response = await axiosClient.post('/api/links/action', {
        action: actionType,
        ids: selectedCheckbox,
      })

      if (response.status === 200) {
        toast.success(`Hành động "${actionType}" đã được thực hiện thành công.`)
        fetchDataLinks()
        setSelectedCheckbox([])
        setIsAllCheckbox(false)
      } else {
        toast.error('Đã xảy ra lỗi khi thực hiện hành động.')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      toast.error('Đã xảy ra lỗi khi thực hiện hành động.')
    } finally {
      setIsLoading(false)
    }
  }

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    if (newPage < 2) {
      setPageNumber(newPage)
      window.scrollTo(0, 0)
      return
    }
    window.scrollTo(0, 0)
    setPageNumber(newPage)
  }

  const items =
    dataLinks?.data && dataLinks?.data?.length > 0
      ? dataLinks?.data.map((item) => ({
          id: (
            <CFormCheck
              style={{
                transform: 'scale(1.4)',
                accentColor: '#198754',
              }}
              key={item?.news_id}
              aria-label="Default select example"
              defaultChecked={item?.news_id}
              id={`flexCheckDefault_${item?.news_id}`}
              value={item?.news_id}
              checked={selectedCheckbox.includes(item?.news_id)}
              onChange={(e) => {
                const newsId = item?.news_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, newsId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== newsId))
                }
              }}
            />
          ),
          url: (
            <div
              style={{
                width: 300,
              }}
            >
              <Link className="blue-txt" to={`/${item?.module}/edit?id=${item?.itemId}`}>
                {item?.slug}
              </Link>
            </div>
          ),
          module: <div className="cate-color">{item?.module}</div>,
          action: item?.action,
          itemid: item?.itemId,
          date: <div>{moment.unix(item?.date).format('hh:mm:ss A, DD-MM-YYYY')}</div>,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item?.itemId, item?.module)}
                className="button-action mr-2 bg-secondary"
              >
                <CTooltip content="Tạm ẩn" placement="top">
                  <CIcon icon={cilBan} className="text-white" />
                </CTooltip>
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.news_id)
                }}
                className="button-action bg-danger"
              >
                <CIcon icon={cilTrash} className="text-white" />
              </button>
            </div>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const columns = [
    {
      key: 'id',
      label: (
        <>
          <CFormCheck
            style={{
              transform: 'scale(1.4)',
              accentColor: '#198754',
            }}
            aria-label="Select all"
            checked={isAllCheckbox}
            onChange={(e) => {
              const isChecked = e.target.checked
              setIsAllCheckbox(isChecked)
              if (isChecked) {
                const allIds = dataLinks?.data.map((item) => item.id) || []
                setSelectedCheckbox(allIds)
              } else {
                setSelectedCheckbox([])
              }
            }}
          />
        </>
      ),
      _props: { scope: 'col' },
    },
    {
      key: 'url',
      label: 'Chuỗi đường dẫn',
      _props: { scope: 'col' },
    },
    {
      key: 'module',
      label: 'Module',
      _props: { scope: 'col' },
    },
    {
      key: 'action',
      label: 'Action',
      _props: { scope: 'col' },
    },
    {
      key: 'itemid',
      label: 'Item ID',
      _props: { scope: 'col' },
    },
    {
      key: 'date',
      label: 'Ngày tạo',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

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
              <h3>QUẢN LÝ LINK WEBSITE</h3>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to={'/seo/links'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12}>
              <table className="filter-table">
                <thead>
                  <tr>
                    <th colSpan="2">
                      <div className="d-flex justify-content-between">
                        <span>Bộ lọc tìm kiếm</span>
                        <span className="toggle-pointer" onClick={handleToggleCollapse}>
                          {isCollapse ? '▼' : '▲'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                {!isCollapse && (
                  <tbody>
                    <tr>
                      <td>Tổng cộng</td>
                      <td className="total-count">{dataLinks?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-25"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: '-- Tất cả --', value: 'All' },
                            { label: 'About', value: 'About' },
                            { label: 'News', value: 'News' },
                            { label: 'Product', value: 'Product' },
                            { label: 'Service', value: 'Service' },
                            { label: 'Promotion', value: 'Promotion' },
                            { label: 'Guide', value: 'Guide' },
                          ]}
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <input
                          type="text"
                          className="search-input"
                          value={dataSearch}
                          onChange={(e) => setDataSearch(e.target.value)}
                        />
                        <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
                          Submit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CCol>

            <CCol md={12}>
              <div className="d-flex justify-content-start gap-3 mt-3">
                <CButton size="sm" color="primary" onClick={() => handleAction('hide')}>
                  Tạm ẩn
                </CButton>
                <CButton size="sm" color="primary" onClick={() => handleAction('show')}>
                  Hiển thị
                </CButton>
                <CButton size="sm" color="primary" onClick={() => handleAction('delete')}>
                  Xóa vĩnh viễn
                </CButton>
              </div>
            </CCol>

            <CCol>
              <CTable hover className="mt-2 border" columns={columns} items={items} />
            </CCol>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataLinks?.total / dataLinks?.per_page)}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                nextLabel={'>>'}
              />
            </div>
          </CRow>
        </>
      )}
    </div>
  )
}

export default LinkManagement
