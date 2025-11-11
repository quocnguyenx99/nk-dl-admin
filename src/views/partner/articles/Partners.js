import { cilColorBorder, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CImage,
  CRow,
  CTable,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'

import './css/partners.scss'

function Partners() {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy giá trị `page` từ URL hoặc mặc định là 1
  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataPartnersCategory, setDataPartnersCategory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  const [dataPartners, setDataPartners] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const handleAddNewClick = () => {
    navigate('/partners/article/add')
  }

  const handleEditClick = (id) => {
    navigate(`/partners/article/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataPartners(keyword)
  }

  const fetchDataPartnersCategory = async (signal) => {
    try {
      const response = await axiosClient.get(`admin/news-category`, { signal })
      if (response.data.status === true) {
        setDataPartnersCategory(response.data.list)
      }
    } catch (error) {
      if (
        error.name !== 'CanceledError' &&
        error.name !== 'AbortError' &&
        error.code !== 'ERR_CANCELED'
      ) {
        console.error('Fetch data partners categories is error', error)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchDataPartnersCategory(controller.signal)
    return () => controller.abort()
  }, [])

  const fetchDataPartners = async (dataSearch = '', signal) => {
    try {
      const response = await axiosClient.get(
        `admin/news?data=${dataSearch}&page=${pageNumber}&category=${selectedCategory}`,
        { signal },
      )

      if (response.data.status === true) {
        setDataPartners(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      if (
        error.name !== 'CanceledError' &&
        error.name !== 'AbortError' &&
        error.code !== 'ERR_CANCELED'
      ) {
        console.error('Fetch partners data is error', error)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchDataPartners(dataSearch, controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, selectedCategory])

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/news/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataPartners()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete partners id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-partners', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataPartners()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataPartners?.data && dataPartners?.data?.length > 0
      ? dataPartners?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.partners_id}
              aria-label="Default select example"
              defaultChecked={item?.partners_id}
              id={`flexCheckDefault_${item?.partners_id}`}
              value={item?.partners_id}
              checked={selectedCheckbox.includes(item?.partners_id)}
              onChange={(e) => {
                const partnersId = item?.partners_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, partnersId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== partnersId))
                }
              }}
            />
          ),
          title: (
            <div
              className="title-color"
              style={{
                width: 300,
              }}
            >
              {item?.news_desc?.title}
            </div>
          ),
          image: (
            <CImage
              className="border"
              src={`${imageBaseUrl}${item.picture}`}
              alt={`Ảnh tin k/m ${item?.news_desc?.id}`}
              width={100}
              height={80}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `${imageBaseUrl}no-image.jpg`
              }}
            />
          ),
          cate: <div className="cate-color">{item?.category_desc?.[0].cat_name}</div>,
          actions: (
            <div className="d-flex">
              <button
                onClick={() => handleEditClick(item.partners_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.partners_id)
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
            aria-label="Select all"
            checked={isAllCheckbox}
            onChange={(e) => {
              const isChecked = e.target.checked
              setIsAllCheckbox(isChecked)
              if (isChecked) {
                const allIds = dataPartners?.data.map((item) => item.partners_id) || []
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
      key: 'title',
      label: 'Tiêu đề',
      _props: { scope: 'col' },
    },
    {
      key: 'image',
      label: 'Hình ảnh',
      _props: { scope: 'col' },
    },
    {
      key: 'cate',
      label: 'Danh mục',
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
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          <CRow className="mb-3">
            <CCol>
              <h3>QUẢN LÝ BÀI ĐĂNG ĐỐI TÁC</h3>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <CButton
                  onClick={handleAddNewClick}
                  color="primary"
                  type="submit"
                  size="sm"
                  className="button-add"
                >
                  Thêm mới
                </CButton>
              </div>
            </CCol>
          </CRow>

          <CRow>
            {/* <Search count={dataPartners?.total} onSearchData={handleSearch} /> */}

            <CCol>
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
                      <td className="total-count">{dataPartners?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn danh mục', value: '' },
                            ...(dataPartnersCategory && dataPartnersCategory.length > 0
                              ? dataPartnersCategory.map((group) => ({
                                  label: group?.partners_category_desc?.cat_name,
                                  value: group.cat_id,
                                }))
                              : []),
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

            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>

            <CCol>
              <CTable hover className="mt-3" columns={columns} items={items} />
            </CCol>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataPartners?.total / dataPartners?.per_page)}
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
                forcePage={pageNumber - 1}
              />
            </div>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Partners
