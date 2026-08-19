import React, { useEffect, useRef } from 'react'
import { CKEditor } from 'ckeditor4-react'

function CKedtiorCustom({ data, onChangeData }) {
  const editorInstance = useRef(null)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
    if (editorInstance.current) {
      const currentData = editorInstance.current.getData()
      if (data !== undefined && data !== null && currentData !== data) {
        editorInstance.current.setData(data)
      }
    }
  }, [data])

  return (
    <CKEditor
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
        const newData = event.editor.getData()
        if (newData !== dataRef.current) {
          onChangeData(newData)
        }
      }}
      onInstanceReady={(event) => {
        editorInstance.current = event.editor
        if (dataRef.current) {
          event.editor.setData(dataRef.current)
        }
      }}
    />
  )
}

export default CKedtiorCustom
