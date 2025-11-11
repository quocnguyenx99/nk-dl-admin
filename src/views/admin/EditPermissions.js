import { CButton, CCol, CContainer, CForm, CFormCheck, CFormInput, CRow } from '@coreui/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

function EditPermissions() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const id = params.get('id')

  const [title, setTitle] = useState('')
  const [role, setRole] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState([])

  const [permissionsData, setPermissionsData] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const fetchDataById = async () => {
    try {
      const response = await axiosClient.get(`admin/role/${id}/edit`)
      const data = response.data.role
      if (response.data.status === true) {
        setTitle(data?.title)
        setRole(data?.name)
        setSelectedPermissions(response.data.permissions)
      }
    } catch (error) {
      console.error('Fetch data admin group by id is error', error)
    }
  }

  useEffect(() => {
    fetchDataById()
  }, [])

  const fetchPermissionsData = async () => {
    try {
      const response = await axiosClient.get(`admin/permission`)
      if (response.data.status === true) {
        setPermissionsData(response.data.permissions)
      }
    } catch (error) {
      console.error('Fetch permissions data is error', error.message)
    }
  }

  useEffect(() => {
    fetchPermissionsData()
  }, [])

  const handleSubmit = async () => {
    try {
      const response = await axiosClient.put(`admin/role/${id}`, {
        title: title,
        name: role,
        permission_id: selectedPermissions,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật phân quyền cho vai trò thành công!')
        fetchPermissionsData()
      }
    } catch (error) {
      console.error('Put role adminstrator data is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CRow md={6}>
          <CCol>
            <h2>PHÂN QUYỀN ADMIN</h2>
          </CCol>
          <CCol md={6}>
            <div className="d-flex justify-content-end">
              <Link to={'/admin/groups'}>
                <CButton color="primary" type="submit" size="sm">
                  Danh sách
                </CButton>
              </Link>
            </div>
          </CCol>
        </CRow>
      </CRow>

      <CRow>
        <CCol md={4}>
          <CForm className="row gy-3">
            <CCol md={12}>
              <CFormInput
                disabled
                id="inputTitle"
                label="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </CCol>

            <CCol md={12}>
              <CFormInput
                disabled
                id="inputPassword"
                label="Vai trò"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </CCol>
          </CForm>
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol>
          <h6>Quyền hạn</h6>
          {permissionsData || Object.keys(permissionsData).length !== 0 ? (
            Object.entries(permissionsData)?.map((tabs) => {
              return (
                <>
                  <table className="filter-table mt-3">
                    <thead>
                      <tr>
                        <th colSpan="2">
                          <div className="d-flex justify-content-between">
                            <span>{tabs?.[0]}</span>
                            <span className="toggle-pointer" onClick={handleToggleCollapse}>
                              {isCollapse ? '▼' : '▲'}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    {!isCollapse && (
                      <tbody>
                        {Object.entries(tabs[1])?.map((item, index) => (
                          <tr key={index}>
                            <td
                              style={{
                                width: '40%',
                              }}
                            >
                              {item?.[0]}
                            </td>
                            <td className="d-flex gap-4 ">
                              {item?.[1].map((permission) => (
                                <CFormCheck
                                  key={permission?.id}
                                  aria-label="Default select example"
                                  defaultChecked={permission?.id}
                                  id={`flexCheckDefault_${permission?.id}`}
                                  label={permission?.name}
                                  value={permission?.id}
                                  checked={selectedPermissions.includes(permission?.id)}
                                  onChange={(e) => {
                                    const permissionId = permission?.id
                                    const isChecked = e.target.checked
                                    if (isChecked) {
                                      setSelectedPermissions([...selectedPermissions, permissionId])
                                    } else {
                                      setSelectedPermissions(
                                        selectedPermissions.filter((id) => id !== permissionId),
                                      )
                                    }
                                  }}
                                />
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </>
              )
            })
          ) : (
            <p>No permission available</p>
          )}
        </CCol>
      </CRow>

      <CRow className="mt-3">
        <CCol xs={12}>
          <CButton onClick={handleSubmit} color="primary" type="submit" size="sm">
            Cập nhật
          </CButton>
        </CCol>
      </CRow>
    </div>
  )
}

export default EditPermissions
