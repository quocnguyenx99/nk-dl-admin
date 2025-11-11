import { CButton, CCol, CContainer, CFormCheck, CFormSelect, CRow } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import axios from 'axios'
import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'
import Loading from '../../../components/loading/Loading'

function ProductProperties() {
  const navigate = useNavigate()

  const [isCollapse, setIsCollapse] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataProductProperties, setDataProductProperties] = useState([])
  const [categories, setCategories] = useState([])

  // loading page
  const [isLoading, setIsLoading] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState('')
  const [choosenCategory, setChoosenCategory] = useState('1')

  const [searchParams, setSearchParams] = useSearchParams()

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

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

  const fetchProductProperties = async (dataSearch = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/cat-option?data=${dataSearch}&catId=${choosenCategory}`,
      )
      const data = response.data.listOption

      if (data) {
        setDataProductProperties(data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data categories is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProductProperties()
  }, [choosenCategory])

  const handleAddNewClick = () => {
    const catId = searchParams.get('cat_id') || '1'
    navigate(`/product/properties/add?cat_id=${catId}`)
  }

  const handleUpdateClick = (slug) => {
    const catId = searchParams.get('cat_id') || '1'
    navigate(`/product/properties/edit?id=${slug}&cat_id=${catId}`)
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/cat-option/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchProductProperties()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete properties id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchProductProperties(keyword)
  }

  const handleChange = (event) => {
    const catId = event.target.value
    searchParams.set('cat_id', catId)
    setSearchParams(searchParams)
    setSelectedCategory(event.target.options[event.target.selectedIndex].label)
    setChoosenCategory(catId)
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
            <CCol md={6}>
              <h3>
                {selectedCategory !== null
                  ? `THUỘC TÍNH ${selectedCategory.toUpperCase()}`
                  : `THUỘC TÍNH SẢN PHẨM`}
              </h3>
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
                <Link to={`/product/properties`}>
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
                      <td className="total-count">6</td>
                    </tr>
                    <tr>
                      <td>Nghành</td>
                      <td>
                        <CFormSelect
                          className="component-size w-25"
                          aria-label="Chọn yêu cầu lọc"
                          value={selectedCategory}
                          onChange={handleChange}
                        >
                          <option>Chọn danh mục</option>
                          {categories &&
                            categories?.map((category) => (
                              <React.Fragment key={category.cat_id}>
                                <option value={category.cat_id}>
                                  {category?.category_desc?.cat_name} ({category.cat_id})
                                </option>
                                {category.parenty &&
                                  category.parenty.map((subCategory) => (
                                    <React.Fragment key={subCategory.cat_id}>
                                      <option value={subCategory.cat_id}>
                                        &nbsp;&nbsp;&nbsp;{'|--'}
                                        {subCategory?.category_desc?.cat_name} ({subCategory.cat_id}
                                        )
                                      </option>

                                      {subCategory.parentx &&
                                        subCategory.parentx.map((subSubCategory) => (
                                          <option
                                            key={subSubCategory.cat_id}
                                            value={subSubCategory.cat_id}
                                          >
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'|--'}
                                            {subSubCategory?.category_desc?.cat_name}(
                                            {subSubCategory.cat_id})
                                          </option>
                                        ))}
                                    </React.Fragment>
                                  ))}
                              </React.Fragment>
                            ))}
                        </CFormSelect>
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
            <CCol>
              {isLoading ? (
                <Loading />
              ) : (
                <table className="table table-hover border caption-top mt-3">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">
                        <CFormCheck id="flexCheckDefault" />
                      </th>
                      <th scope="col">Tên</th>
                      <th scope="col">Chuỗi đường dẫn</th>
                      <th scope="col">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataProductProperties &&
                      dataProductProperties.map((option) => (
                        <React.Fragment key={option.op_id}>
                          <tr>
                            <td scope="row">
                              <CFormCheck id="flexCheckDefault" />
                            </td>
                            <td scope="row" style={{ fontWeight: 600 }}>
                              {option.title}
                            </td>
                            <td scope="row">{option.slug}</td>
                            <td scope="row">
                              <div>
                                <button
                                  onClick={() => handleUpdateClick(option.op_id)}
                                  className="button-action mr-2 bg-info"
                                >
                                  <CIcon icon={cilColorBorder} className="text-white" />
                                </button>
                                <button
                                  onClick={() => {
                                    setVisible(true)
                                    setDeletedId(option.op_id)
                                  }}
                                  className="button-action bg-danger"
                                >
                                  <CIcon icon={cilTrash} className="text-white" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {option?.optionChild &&
                            option?.optionChild.map((optionChild) => (
                              <React.Fragment key={optionChild.op_id}>
                                <tr>
                                  <td scope="row">
                                    <CFormCheck id="flexCheckDefault" />
                                  </td>
                                  <td>
                                    <img
                                      src="https://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif"
                                      alt="Subcategory"
                                      className="mr-2"
                                    />
                                    {optionChild.title}
                                  </td>
                                  <td>{optionChild.slug}</td>
                                  <td scope="row">
                                    <div>
                                      <button
                                        onClick={() => handleUpdateClick(optionChild.op_id)}
                                        className="button-action mr-2 bg-info"
                                      >
                                        <CIcon icon={cilColorBorder} className="text-white" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setVisible(true)
                                          setDeletedId(optionChild.op_id)
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

export default ProductProperties
