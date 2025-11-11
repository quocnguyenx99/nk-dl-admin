import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
import { axiosClient } from '../axiosConfig'

export const AppSidebarNav = ({ items }) => {
  const [dataNotSeen, setDataNotSeen] = useState({})
  useEffect(() => {
    const fetchNotSeenData = async () => {
      try {
        const response = await axiosClient.get('/admin/no-approved-statistics')

        if (response.data.status === true) {
          setDataNotSeen(response.data)
        }
      } catch (error) {
        console.error('Fetch data not seen is error', error)
      }
    }

    fetchNotSeenData()
  }, [])

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        <div style={{ fontSize: '14.4px', fontWeight: 500 }}>{name && name}</div>
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
        {name == 'QUẢN LÝ ĐƠN HÀNG' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countOrderSum}
          </CBadge>
        )}
        {name == 'QUẢN LÝ TUYỂN DỤNG' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countCandidates}
          </CBadge>
        )}
        {name == 'QUẢN LÝ COMMENT' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countComment}
          </CBadge>
        )}
        {name == 'QUẢN LÝ LIÊN HỆ' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countContactQoute}
          </CBadge>
        )}
        {name == 'QUẢN LÝ NEWSLETTER' && (
          <CBadge color={'danger'} className="ms-auto" size="sm">
            {dataNotSeen?.countMailList}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item
    const Component = component
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
