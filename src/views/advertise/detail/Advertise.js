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
import Loading from '../../../components/loading/Loading'

// import './css/news.scss'

function Advertise() {
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

  const [dataAdvertise, setDataAdvertise] = useState([])

  const [dataAdvertisePos, setDataAdvertisePos] = useState([])
  const [selectedPosition, setSelectedPosition] = useState('')

  // loading button
  const [isLoading, setIsLoading] = useState(false)

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
    navigate('/advertise/add')
  }

  const handleEditClick = (id) => {
    navigate(`/advertise/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataAdvertise(keyword)
  }

  const fetchDataAdvertisePos = async () => {
    try {
      const response = await axiosClient.get(`admin/ad-pos`)
      if (response.data.status === 'success') {
        setDataAdvertisePos(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data news is error', error)
    }
  }

  useEffect(() => {
    fetchDataAdvertisePos()
  }, [])

  const fetchDataAdvertise = async (dataSearch = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/advertise?data=${dataSearch}&page=${pageNumber}&pos=${selectedPosition}`,
      )

      if (response.data.status === true) {
        setDataAdvertise(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch promotion news data is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataAdvertise()
  }, [pageNumber, selectedPosition])

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
      const response = await axiosClient.delete(`admin/advertise/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataAdvertise()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete advertise id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-advertise', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Đã xóa các mục được chọn!')
        fetchDataAdvertise()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataAdvertise?.data && dataAdvertise?.data?.length > 0
      ? dataAdvertise?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const advertiseId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, advertiseId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== advertiseId))
                }
              }}
            />
          ),
          image: (
            <CImage
              // className="border"
              src={`${imageBaseUrl}${item.picture}`}
              alt={`Ảnh tin advertise ${item?.id}`}
              width={200}
              loading="lazy"
            />
          ),
          url: (
            <div style={{ width: 250 }} className="cate-color">
              {item?.link}
            </div>
          ),
          dimension: <div>{`${item.width}x${item.height}`}</div>,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
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
                const allIds = dataAdvertise?.data.map((item) => item.id) || []
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
      key: 'image',
      label: 'Hình ảnh',
      _props: { scope: 'col' },
    },
    {
      key: 'url',
      label: 'Liên kết',
      _props: { scope: 'col' },
    },
    {
      key: 'dimension',
      label: 'Kích thước',
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
              <h2>QUẢN LÝ ADVERTISE</h2>
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
                <Link to={'/advertise'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
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
                      <td className="total-count">{dataAdvertise?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn vị trí', value: '' },
                            ...(dataAdvertisePos && dataAdvertisePos.length > 0
                              ? dataAdvertisePos.map((pos) => ({
                                  label: pos.title,
                                  value: pos.name,
                                }))
                              : []),
                          ]}
                          value={selectedPosition}
                          onChange={(e) => setSelectedPosition(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <em>
                          <strong>Tìm kiếm theo từ khóa theo Tiêu đề, Danh mục vị trí</strong>
                        </em>
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
              {isLoading ? (
                <Loading />
              ) : (
                <CTable hover className="mt-3 border" columns={columns} items={items} />
              )}
            </CCol>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataAdvertise?.total / dataAdvertise?.per_page)}
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
                forcePage={pageNumber - 1} // Đảm bảo pagination hiển thị đúng trang hiện tại
              />
            </div>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Advertise
