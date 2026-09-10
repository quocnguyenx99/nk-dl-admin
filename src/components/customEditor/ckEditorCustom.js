import React, { useEffect, useRef } from 'react'
import { CKEditor } from 'ckeditor4-react'

function CKedtiorCustom({ data, onChangeData, name }) {
  const editorInstance = useRef(null)
  const dataRef = useRef(data)
  const isSettingData = useRef(false)

  useEffect(() => {
    dataRef.current = data
    if (editorInstance.current && !isSettingData.current) {
      const currentData = editorInstance.current.getData()
      if (data !== undefined && data !== null && currentData !== data) {
        isSettingData.current = true
        editorInstance.current.setData(data, {
          callback: () => {
            setTimeout(() => {
              isSettingData.current = false
            }, 50)
          },
        })
      }
    }
  }, [data])

  return (
    <CKEditor
      name={name}
      config={{
        versionCheck: false,
        extraPlugins: ['justify', 'colorbutton', 'font'],
        filebrowserBrowseUrl: 'https://media.vitinhnguyenkim.vn/ckfinder/ckfinder.html',
        filebrowserImageBrowseUrl:
          'https://media.vitinhnguyenkim.vn/ckfinder/ckfinder.html?type=Images',
        filebrowserUploadUrl:
          'https://media.vitinhnguyenkim.vn/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
        filebrowserImageUploadUrl:
          'https://media.vitinhnguyenkim.vn/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images',
      }}
      initData={data}
      onChange={(event) => {
        if (isSettingData.current) return
        const newData = event.editor.getData()
        if (newData !== dataRef.current) {
          dataRef.current = newData
          onChangeData(newData)
        }
      }}
      onInstanceReady={(event) => {
        editorInstance.current = event.editor
        if (dataRef.current) {
          const currentData = event.editor.getData()
          if (currentData !== dataRef.current) {
            isSettingData.current = true
            event.editor.setData(dataRef.current, {
              callback: () => {
                setTimeout(() => {
                  isSettingData.current = false
                }, 50)
              },
            })
          }
        }
      }}
    />
  )
}

export default CKedtiorCustom
