import { CButton, CCol, CContainer, CFormCheck, CImage, CRow } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import Search from '../../../components/search/Search'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import { Link, useNavigate } from 'react-router-dom'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { toast } from 'react-toastify'
import Loading from '../../../components/loading/Loading'

function ProductCategory() {
  const navigate = useNavigate()

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [categories, setCategories] = useState([])

  // loading page
  const [isLoading, setIsLoading] = useState(false)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const fetchDataCategories = async (dataSearch = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`admin/category?data=${dataSearch}`)
      const data = response.data.data

      if (data) {
        setCategories(data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data categories is error', error)
      if (error.response) {
        if (error.response.status === 500) {
          navigate('/500')
        } else if (error.response.status === 404) {
          navigate('/404')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataCategories()
  }, [])

  const handleAddNewClick = () => {
    navigate('/product/category/add')
  }

  const handleUpdateClick = (id) => {
    navigate(`/product/category/edit?id=${id}`)
  }

  const handleSearch = (keyword) => {
    fetchDataCategories(keyword)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/category/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataCategories()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete category id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-product-category', {
        ids: selectedCheckbox,
        _method: 'DELETE',
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataInstruct()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
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
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />
          <CRow className="mb-3">
            <CCol>
              <h3>DANH MỤC SẢN PHẨM</h3>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
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
                <Link to={`/product/category`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol>
              <Search count={categories.length} onSearchData={handleSearch} />
              <div className="mt-3">
                <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </div>
              {isLoading ? (
                <Loading />
              ) : (
                <table className="table table-hover caption-top mt-3">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col"></th>
                      <th scope="col">Tên</th>
                      <th scope="col">Background</th>
                      <th scope="col">Show home</th>
                      <th scope="col">Đường dẫn</th>
                      <th scope="col">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories &&
                      categories.length > 0 &&
                      categories.map((cate) => (
                        <React.Fragment key={cate.cat_id}>
                          <tr>
                            <td scope="row">
                              <CFormCheck
                                style={{
                                  transform: 'scale(1.4)',
                                  accentColor: '#198754',
                                }}
                                key={cate?.cat_id}
                                aria-label="Default select example"
                                defaultChecked={cate?.cat_id}
                                id={`flexCheckDefault_${cate?.cat_id}`}
                                value={cate?.cat_id}
                                checked={selectedCheckbox.includes(cate?.cat_id)}
                                onChange={(e) => {
                                  const catId = cate?.cat_id
                                  const isChecked = e.target.checked
                                  if (isChecked) {
                                    setSelectedCheckbox([...selectedCheckbox, catId])
                                  } else {
                                    setSelectedCheckbox(
                                      selectedCheckbox.filter((id) => id !== catId),
                                    )
                                  }
                                }}
                              />
                            </td>
                            <td scope="row" style={{ fontWeight: 600, color: '#3c8dbc' }}>
                              <Link
                                to={`/product/category/edit?id=${cate.cat_id}`}
                                style={{ color: '#3c8dbc', textDecoration: 'none' }}
                              >
                                {cate?.category_desc?.cat_name}
                              </Link>
                            </td>
                            <td scope="row">
                              <CImage
                                src={`${imageBaseUrl}${cate.background !== null && cate.background !== '' ? cate.background : 'no-image.jpg'}`}
                                width={50}
                              />
                            </td>
                            <td scope="row">{cate.show_home === true ? 'Có' : 'Không'}</td>
                            <td scope="row" style={{ color: '#f77225' }}>
                              {cate?.category_desc?.friendly_url}
                            </td>
                            <td scope="row">
                              <div>
                                <button
                                  onClick={() => handleUpdateClick(cate.cat_id)}
                                  className="button-action mr-2 bg-info"
                                >
                                  <CIcon icon={cilColorBorder} className="text-white" />
                                </button>
                                <button
                                  onClick={() => {
                                    setVisible(true)
                                    setDeletedId(cate.cat_id)
                                  }}
                                  className="button-action bg-danger"
                                >
                                  <CIcon icon={cilTrash} className="text-white" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {cate.parenty &&
                            cate.parenty.map((subCate) => (
                              <React.Fragment key={subCate.cat_id}>
                                <tr>
                                  <td scope="row">
                                    <CFormCheck
                                      style={{
                                        transform: 'scale(1.4)',
                                        accentColor: '#198754',
                                      }}
                                      key={subCate?.cat_id}
                                      aria-label="Default select example"
                                      defaultChecked={subCate?.cat_id}
                                      id={`flexCheckDefault_${subCate?.cat_id}`}
                                      value={subCate?.cat_id}
                                      checked={selectedCheckbox.includes(subCate?.cat_id)}
                                      onChange={(e) => {
                                        const catId = subCate?.cat_id
                                        const isChecked = e.target.checked
                                        if (isChecked) {
                                          setSelectedCheckbox([...selectedCheckbox, catId])
                                        } else {
                                          setSelectedCheckbox(
                                            selectedCheckbox.filter((id) => id !== catId),
                                          )
                                        }
                                      }}
                                    />
                                  </td>
                                  <td style={{ fontWeight: 600, color: '#3c8dbc' }}>
                                    <Link
                                      to={`/product/category/edit?id=${subCate.cat_id}`}
                                      style={{ color: '#3c8dbc', textDecoration: 'none' }}
                                    >
                                      <img
                                        src="https://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif"
                                        alt="Subcategory"
                                        className="mr-2"
                                      />
                                      {subCate?.category_desc?.cat_name}
                                    </Link>
                                  </td>
                                  <td scope="row">
                                    <CImage
                                      src={`${imageBaseUrl}${subCate.background !== null && subCate.background !== '' ? subCate.background : 'no-image.jpg'}`}
                                      width={50}
                                    />
                                  </td>
                                  <td scope="row"></td>
                                  <td scope="row" style={{ color: '#f77225' }}>
                                    {subCate?.category_desc?.friendly_url}
                                  </td>
                                  <td scope="row">
                                    <div>
                                      <button
                                        onClick={() => handleUpdateClick(subCate.cat_id)}
                                        className="button-action mr-2 bg-info"
                                      >
                                        <CIcon icon={cilColorBorder} className="text-white" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setVisible(true)
                                          setDeletedId(subCate.cat_id)
                                        }}
                                        className="button-action bg-danger"
                                      >
                                        <CIcon icon={cilTrash} className="text-white" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {subCate.parentx &&
                                  subCate.parentx.map((childCate) => (
                                    <React.Fragment key={childCate.cat_id}>
                                      <tr>
                                        <td scope="row">
                                          <CFormCheck
                                            style={{
                                              transform: 'scale(1.4)',
                                              accentColor: '#198754',
                                            }}
                                            key={childCate?.cat_id}
                                            aria-label="Default select example"
                                            defaultChecked={childCate?.cat_id}
                                            id={`flexCheckDefault_${childCate?.cat_id}`}
                                            value={childCate?.cat_id}
                                            checked={selectedCheckbox.includes(childCate?.cat_id)}
                                            onChange={(e) => {
                                              const catId = childCate?.cat_id
                                              const isChecked = e.target.checked
                                              if (isChecked) {
                                                setSelectedCheckbox([...selectedCheckbox, catId])
                                              } else {
                                                setSelectedCheckbox(
                                                  selectedCheckbox.filter((id) => id !== catId),
                                                )
                                              }
                                            }}
                                          />
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#3c8dbc' }}>
                                          <Link
                                            to={`/product/category/edit?id=${childCate.cat_id}`}
                                            style={{ color: '#3c8dbc', textDecoration: 'none' }}
                                          >
                                            <img
                                              src="https://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif"
                                              alt="Subcategory"
                                              style={{ marginLeft: 16 }}
                                            />
                                            {childCate?.category_desc?.cat_name}
                                          </Link>
                                        </td>
                                        <td scope="row">
                                          <CImage
                                            src={`${imageBaseUrl}${childCate.background !== null && childCate.background !== '' ? childCate.background : 'no-image.jpg'}`}
                                            width={50}
                                          />
                                        </td>
                                        <td scope="row"></td>
                                        <td scope="row" style={{ color: '#f77225' }}>
                                          {childCate?.category_desc?.friendly_url}
                                        </td>
                                        <td scope="row">
                                          <div>
                                            <button
                                              onClick={() => handleUpdateClick(childCate.cat_id)}
                                              className="button-action mr-2 bg-info"
                                            >
                                              <CIcon icon={cilColorBorder} className="text-white" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setVisible(true)
                                                setDeletedId(childCate.cat_id)
                                              }}
                                              className="button-action bg-danger"
                                            >
                                              <CIcon icon={cilTrash} className="text-white" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ))}
                              </React.Fragment>
                            ))}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              )}
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default ProductCategory
