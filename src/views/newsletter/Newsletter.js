import { cilColorBorder, cilEnvelopeClosed, cilEnvelopeOpen, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CContainer, CFormCheck, CRow, CTable } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import moment from 'moment/moment'
import { toast } from 'react-toastify'

function Newsletters() {
  const navigate = useNavigate()

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataNewsLetter, setDataNewsLetter] = useState([])

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

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const handleAddNewClick = () => {
    navigate('/newsletter/add')
  }

  const handleEditClick = (id) => {
    navigate(`/newsletter/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataNewsLetter(keyword)
  }

  const fetchDataNewsLetter = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`/admin/mail-list?data=${dataSearch}`)

      if (response.data.status === true) {
        setDataNewsLetter(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch mail temp data is error', error)
    }
  }

  useEffect(() => {
    fetchDataNewsLetter()
  }, [pageNumber])

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/mail-list/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataNewsLetter()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete newsletter id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-mail-list', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataNewsLetter()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataNewsLetter && dataNewsLetter?.length > 0
      ? dataNewsLetter.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const newsletterId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, newsletterId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== newsletterId))
                }
              }}
            />
          ),

          mail: (
            <div
              style={{
                minWidth: 120,
              }}
              className="blue-txt"
            >
              {item?.email}
            </div>
          ),

          dateRegister: <div>{moment.unix(item?.date_send).format('hh:mm:ss A, DD/MM/YYYY')}</div>,
          seen:
            item?.status === 1 ? (
              <CIcon icon={cilEnvelopeOpen} />
            ) : (
              <CIcon icon={cilEnvelopeClosed} className="text-warning" />
            ),

          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item?.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item?.id)
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
                const allIds = dataNewsLetter?.map((item) => item.id) || []
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
      key: 'mail',
      label: 'Thư điện tử',
      _props: { scope: 'col' },
    },

    {
      key: 'dateRegister',
      label: 'Ngày đăng ký',
      _props: { scope: 'col' },
    },
    {
      key: 'seen',
      label: <CIcon icon={cilEnvelopeClosed} />,
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
              <h2>QUẢN LÝ NEWSLETTER</h2>
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
                <Link to={'/newsletter'}>
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
                      <td className="total-count">{dataNewsLetter?.length}</td>
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
              <CTable
                style={{
                  fontSize: 13.6,
                }}
                hover
                className="mt-3"
                columns={columns}
                items={items}
              />
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Newsletters
